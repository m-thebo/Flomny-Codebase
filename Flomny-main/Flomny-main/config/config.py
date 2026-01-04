import json
import os

CONFIG_PATH = "./config.json"

# Load configuration
with open(CONFIG_PATH, "r") as file:
    config = json.load(file)

# Set model provider (either "google" or "openai")
MODEL_PROVIDER = config.get("MODEL_PROVIDER", "google").lower()

# Load API keys based on provider
if MODEL_PROVIDER == "google":
    API_KEY = config.get("GOOGLE_API_KEY")
elif MODEL_PROVIDER == "openai":
    API_KEY = config.get("OPENAI_API_KEY")
else:
    raise ValueError("Invalid MODEL_PROVIDER. Use 'google' or 'openai'.")

# Load Tavily API Key
TAVILY_API_KEY = config.get("TAVILY_API_KEY")
os.environ["TAVILY_API_KEY"] = TAVILY_API_KEY  # Set environment variable
