import os
import re
import json
import tempfile
import subprocess
import time
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from pymongo import MongoClient
import requests
from dotenv import load_dotenv
import boto3

app = Flask(__name__)
CORS(app)

PLACEHOLDER_PATTERN = r"<<<\.([A-Za-z0-9_ ]+):([A-Za-z0-9_ ]+)>>>"
IMPORT_PATTERN = r"^\s*(?:import|from)\s+([a-zA-Z0-9_\.]+)"

# Load environment variables
load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'eu-north-1')

# MongoDB client (reuse across requests)
mongo_client = MongoClient(MONGO_URL) if MONGO_URL else None

def connect_to_s3():
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        return s3_client
    except Exception as e:
        print(f"S3 connection error: {e}")
        return None

def download_file_from_s3(s3_client, bucket_name, file_name, local_path=None):
    try:
        if local_path is None:
            local_path = f"/tmp/{file_name}"
        s3_client.download_file(bucket_name, file_name, local_path)
        return local_path
    except Exception as e:
        print(f"Error downloading file from S3: {e}")
        return None

def parse_s3_bucket_key_from_url(url):
    # Assumes URL format: http(s)://.../docs/<bucket>/<key>
    try:
        parts = url.split('/docs/', 1)[-1].split('/', 1)
        bucket = parts[0]
        key = parts[1]
        return bucket, key
    except Exception:
        return None, None

def replace_placeholders(code, params):
    def replacer(match):
        key = match.group(0)
        return params.get(key, key)
    return re.sub(PLACEHOLDER_PATTERN, replacer, code)


def extract_imports(code):
    imports = set()
    for line in code.splitlines():
        match = re.match(IMPORT_PATTERN, line)
        if match:
            module = match.group(1).split(".")[0]
            imports.add(module)
    return list(imports)


def build_and_run_docker_stream(code, requirements, log_timeout=15):
    import threading
    import queue
    with tempfile.TemporaryDirectory() as tmpdir:
        code_path = os.path.join(tmpdir, "main.py")
        req_path = os.path.join(tmpdir, "requirements.txt")
        dockerfile_path = os.path.join(tmpdir, "Dockerfile")

        with open(code_path, "w") as f:
            f.write(code)
        with open(req_path, "w") as f:
            f.write("\n".join(requirements))
        with open(dockerfile_path, "w") as f:
            f.write(f"""
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
CMD [\"python\", \"main.py\"]
""")
        image_tag = f"exec_service_{os.getpid()}"
        container_name = f"exec_container_{os.getpid()}"
        build_cmd = ["docker", "build", "-t", image_tag, tmpdir]
        run_cmd = ["docker", "run", "-d", "--name", container_name, image_tag]
        logs_cmd = ["docker", "logs", "-f", container_name]
        stop_cmd = ["docker", "stop", container_name]
        rm_cmd = ["docker", "rm", container_name]
        rmi_cmd = ["docker", "rmi", "-f", image_tag]
        inspect_exit_code_cmd = ["docker", "inspect", "-f", "{{.State.ExitCode}}", container_name]
        try:
            subprocess.check_output(build_cmd, stderr=subprocess.STDOUT)
            container_id = subprocess.check_output(run_cmd, stderr=subprocess.STDOUT).decode().strip()
            # Use a queue to communicate logs from thread
            log_queue = queue.Queue()
            finished = threading.Event()
            error = [None]

            def log_reader():
                try:
                    proc = subprocess.Popen(logs_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, bufsize=1, text=True)
                    for line in proc.stdout:
                        log_queue.put(line)
                    proc.stdout.close()
                    proc.wait()
                except Exception as e:
                    error[0] = str(e)
                finally:
                    finished.set()

            t = threading.Thread(target=log_reader)
            t.start()

            last_log_time = time.time()
            while True:
                try:
                    line = log_queue.get(timeout=0.5)
                    last_log_time = time.time()
                    yield {"event": "log", "data": line}
                except queue.Empty:
                    if finished.is_set():
                        break
                    if time.time() - last_log_time > log_timeout:
                        # Timeout
                        subprocess.call(stop_cmd)
                        subprocess.call(rm_cmd)
                        yield {"event": "timeout", "data": f"Execution timed out after {log_timeout} seconds."}
                        return
            # After logs are done, check exit code
            try:
                exit_code = int(subprocess.check_output(inspect_exit_code_cmd, stderr=subprocess.STDOUT).decode().strip())
            except Exception:
                exit_code = -1
            subprocess.call(stop_cmd)
            subprocess.call(rm_cmd)
            if error[0]:
                yield {"event": "error", "data": error[0]}
            elif exit_code == 0:
                yield {"event": "success", "data": "Execution completed successfully."}
            else:
                yield {"event": "error", "data": "Code execution failed with a non-zero exit code."}
        except subprocess.CalledProcessError as e:
            yield {"event": "error", "data": e.output.decode()}
        except Exception as e:
            yield {"event": "error", "data": str(e)}
        finally:
            subprocess.call(rmi_cmd)


def sse_format(event, data):
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.route("/execute", methods=["POST"])
def execute():
    data = request.get_json()
    code = data.get("code")
    workflow_id = data.get("workflowId")
    params = data.get("parameters", {})

    # If workflowId is provided, fetch code from S3 using workflowURL in MongoDB
    if workflow_id:
        if not mongo_client:
            return jsonify({
                "status": "error",
                "message": "MongoDB connection not configured",
                "logs": None,
                "imports": [],
                "error": "MongoDB connection not configured"
            }), 500
        try:
            db = mongo_client["fyp-db"]
            workflows = db["workflows"]
            from bson import ObjectId
            workflow_doc = workflows.find_one({"_id": ObjectId(workflow_id)})
            if not workflow_doc:
                return jsonify({
                    "status": "error",
                    "message": f"Workflow with id {workflow_id} not found",
                    "logs": None,
                    "imports": [],
                    "error": "Workflow not found"
                }), 404
            workflow_url = workflow_doc.get("workflowURL")
            if not workflow_url:
                return jsonify({
                    "status": "error",
                    "message": f"Workflow URL not found in workflow document",
                    "logs": None,
                    "imports": [],
                    "error": "Workflow URL not found"
                }), 400
            # Parse S3 bucket and key from workflowURL
            bucket, key = parse_s3_bucket_key_from_url(workflow_url)
            if not bucket or not key:
                return jsonify({
                    "status": "error",
                    "message": f"Could not parse S3 bucket/key from workflowURL: {workflow_url}",
                    "logs": None,
                    "imports": [],
                    "error": "Invalid workflowURL format"
                }), 400
            s3_client = connect_to_s3()
            if not s3_client:
                return jsonify({
                    "status": "error",
                    "message": "Could not connect to S3",
                    "logs": None,
                    "imports": [],
                    "error": "S3 connection failed"
                }), 500
            # Download file from S3
            with tempfile.NamedTemporaryFile(delete=False) as tmpfile:
                local_path = tmpfile.name
            file_path = download_file_from_s3(s3_client, bucket, key, local_path)
            if not file_path:
                return jsonify({
                    "status": "error",
                    "message": f"Failed to download file from S3: bucket={bucket}, key={key}",
                    "logs": None,
                    "imports": [],
                    "error": "S3 download failed"
                }), 400
            with open(file_path, 'r') as f:
                code = f.read()
            os.remove(file_path)
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Error fetching workflow: {str(e)}",
                "logs": None,
                "imports": [],
                "error": str(e)
            }), 500
    if not code:
        return jsonify({
            "status": "error",
            "message": "No code provided",
            "logs": None,
            "imports": [],
            "error": "No code provided"
        }), 400
    processed_code = replace_placeholders(code, params)
    imports = extract_imports(processed_code)

    def event_stream():
        for event in build_and_run_docker_stream(processed_code, imports):
            yield sse_format(event["event"], event["data"])

    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=50010) 