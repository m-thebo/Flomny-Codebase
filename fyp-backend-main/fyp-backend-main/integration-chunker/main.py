import redis
import time
import json
import boto3
from botocore.client import Config
import yaml
import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.schema import Document
from langchain_pinecone import PineconeVectorStore

load_dotenv()  # This loads the .env file into environment variables

# EMBEDDINGS
embedding_model = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key= os.getenv("GOOGLE_API_KEY")
)
# VECTOR STORE
vector_store = PineconeVectorStore(
    index_name= "flomny-the-new-start",
    embedding=embedding_model,
    pinecone_api_key= os.getenv("PINECONE_API_KEY")
)


def collect_all_parameters(path_item, operation):
    path_params = path_item.get("parameters", [])
    op_params = operation.get("parameters", [])
    return path_params + op_params

def format_parameters(params):
    if not params:
        return "None"
    lines = []
    for p in params:
        name = p.get("name")
        location = p.get("in")
        required = p.get("required", False)
        description = p.get("description", "")
        schema = p.get("schema", {})
        type_ = schema.get("type", "unknown")
        enum = schema.get("enum")
        enum_str = str(enum) if enum else ""
        req_str = "required" if required else "optional"
        lines.append(f"- {name} ({location}, {type_}, {req_str}): {description}{enum_str}")
    return "\n".join(lines)

def format_request_body(request_body):
    if not request_body:
        return "None"
    content = request_body.get("content", {})
    if "application/json" in content:
        schema = content["application/json"].get("schema", {})
        props = schema.get("properties", {})
        required = schema.get("required", [])
        lines = []
        for name, val in props.items():
            type_ = val.get("type", "unknown")
            enum = val.get("enum")
            enum_str = str(enum) if enum else ""
            req_str = "required" if name in required else "optional"
            lines.append(f"- {name} ({type_}, {req_str}){enum_str}")
        return "\n".join(lines)
    return "Unsupported content type"

def format_responses(responses):
    lines = []
    for status, resp in responses.items():
        desc = resp.get("description", "")
        lines.append(f"- {status}: {desc}")
    return "\n".join(lines)

def describe_security(security, security_schemes):
    if not security:
        return "None"
    descriptions = []
    for scheme_group in security:
        for name in scheme_group:
            scheme = security_schemes.get(name, {})
            scheme_type = scheme.get("type", "unknown")
            description = f"{name} (type: {scheme_type}"
            if "scheme" in scheme:
                description += f", scheme: {scheme['scheme']}"
            if "bearerFormat" in scheme:
                description += f", bearerFormat: {scheme['bearerFormat']}"
            description += ")"
            descriptions.append(description)
    return "\n".join(descriptions)

def create_openapi_chunks(yaml_content, integration_name="generic"):
    chunks = []
    paths = yaml_content.get("paths", {})
    security_schemes = yaml_content.get("components", {}).get("securitySchemes", {})

    for path, path_item in paths.items():
        for method in path_item:
            if method not in ["get", "post", "put", "delete", "patch", "options", "head"]:
                continue
            operation = path_item[method]

            summary = operation.get("summary", "")
            description = operation.get("description", "")
            all_params = collect_all_parameters(path_item, operation)
            request_body = operation.get("requestBody")
            responses = operation.get("responses", {})
            security = operation.get("security", [])

            chunk = f"""Integration: {integration_name}
Authentication Required: {describe_security(security, security_schemes)}
Path: {path}
Method: {method.upper()}
Summary: {summary}
Description: {description}

Parameters:
{format_parameters(all_params)}

Request Body:
{format_request_body(request_body)}

Responses:
{format_responses(responses)}
"""
            chunks.append({
                "id": f"{integration_name}:{method.upper()}:{path}",
                "text": chunk,
                "summary": summary
            })

    return chunks
def chunk_file(file_path, integration_id):
    """Chunk a file into smaller pieces"""
    # Read the file
    with open(file_path, 'r') as file:
        yaml_content = yaml.safe_load(file)

    # Display sample
    print(yaml_content)

    chunks = create_openapi_chunks(yaml_content, integration_name=integration_id)

    for _, i in enumerate(chunks):
        print("########## CHUNK #############")
        print(i["id"])
        print(i["text"])
        print("\n")

    all_docs = [
        Document(
            page_content=chunk["text"],
            metadata={
                "id": chunk["id"],
                "method": chunk["id"].split(":")[1],
                "path": chunk["id"].split(":")[2],
                "integration": integration_id,
                "summary": chunk["summary"],
            }
        )
        for chunk in chunks
    ]
    # Store the documents in the vector store
    vector_store.add_documents(all_docs)
    print(f"Successfully stored {len(all_docs)} documents with full API details")


def connect_to_redis(host='redis', port=6379, password='secretpass'):
    """Establish connection to Redis server"""
    try:
        r = redis.Redis(host=host, port=port, password=password, decode_responses=True)
        r.ping()
        print("Connected to Redis")
        return r
    except redis.exceptions.ConnectionError as e:
        print(f"Redis connection error: {e}")
        return None


def connect_to_s3():
    """Establish connection to AWS S3 storage"""
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'eu-north-1')
        )
        
        # Test connection by listing buckets
        response = s3_client.list_buckets()
        print(f"Connected to S3. Available buckets: {[bucket['Name'] for bucket in response['Buckets']]}")
        return s3_client
    except Exception as e:
        print(f"S3 connection error: {e}")
        return None


def download_file_from_s3(s3_client, bucket_name, file_name, local_path=None):
    """Download a file from AWS S3 to local storage"""
    try:
        if local_path is None:
            local_path = f"/tmp/{file_name}"
        
        print(f"Downloading file '{file_name}' from S3 bucket '{bucket_name}'...")
        s3_client.download_file(bucket_name, file_name, local_path)
        print(f"File downloaded successfully to {local_path}")
        return local_path
    except Exception as e:
        print(f"Error downloading file from S3: {e}")
        return None


def process_message(s3_client, message_data):
    """Process a message received from Redis"""
    try:
        payload = json.loads(message_data)
        print(f"Parsed Payload: {payload}")
        
        # Extract integration ID from payload
        integration_id = payload['id']
        file_url = payload['additionalInfo'].get('documentationURL')
        file_name = file_url.split('/')[-1]
        
        if file_url and 'additionalInfo' in payload and payload['additionalInfo'].get('isFileBased'):
            bucket_name = payload['additionalInfo'].get('bucketName', 'flomny-integrations')
            
            print(f"Processing file: {file_name}")
            print(f"Looking for file at S3 bucket: {bucket_name}, path: {file_name}")
            
            # Download the file from S3
            file_path = download_file_from_s3(s3_client, bucket_name, file_name)
            
            if file_path:
                print(f"Ready to process file at: {file_path}")
                return file_path, integration_id
            else:
                print(f"Failed to download file for file: {file_name}")
        else:
            print("Not a file-based integration or missing required information")
        
        return None
    except Exception as e:
        print(f"Failed to process message: {e}")
        return None


def listen_for_messages(redis_client, s3_client, channel='integration_created'):
    """Listen for messages on the specified Redis channel"""
    pubsub = redis_client.pubsub()
    pubsub.psubscribe(channel)
    print(f"Subscribed to channel '{channel}'")
    
    while True:
        message = pubsub.get_message()
        if message and message['type'] == 'pmessage':
            channel = message['channel']
            data = message['data']
            print(f"Received message on channel '{channel}': {data}")
            
            # Process the message
            file_path, integration_id = process_message(s3_client, data)
            
            # Do the chunking here
            chunk_file(file_path, integration_id)

        else:
            print("Alive, waiting for messages...")
        time.sleep(2)


def main():
    """Main function to initialize connections and start listening"""
    # Connect to Redis
    redis_client = connect_to_redis()
    if not redis_client:
        exit(1)
    
    # Connect to S3
    s3_client = connect_to_s3()
    if not s3_client:
        exit(1)
    
    # Start listening for messages
    listen_for_messages(redis_client, s3_client)


if __name__ == "__main__":
    main()
