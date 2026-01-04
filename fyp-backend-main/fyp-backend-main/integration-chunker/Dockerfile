FROM python:3.12-slim

WORKDIR /app

# Copy your requirements.txt (if you have one) and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Install redis Python client
RUN pip install redis

# Copy the rest of the application files
COPY . /app/

CMD ["python", "main.py"]
