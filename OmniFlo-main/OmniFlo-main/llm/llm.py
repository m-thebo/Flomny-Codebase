from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from config.config import MODEL_PROVIDER, API_KEY

def get_llm(model="default"):
    """Returns the appropriate LLM model based on MODEL_PROVIDER."""
    if MODEL_PROVIDER == "google":
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp" if model == "default" else model,
            google_api_key=API_KEY,
            temperature=0
        )
    elif MODEL_PROVIDER == "openai":
        return ChatOpenAI(
            model="gpt-4o-mini" if model == "default" else model,
            openai_api_key=API_KEY,
            temperature=0
        )
    else:
        raise ValueError("Invalid MODEL_PROVIDER. Use 'google' or 'openai'.")

def get_embedding_model():
    """Returns the appropriate embedding model based on MODEL_PROVIDER."""
    if MODEL_PROVIDER == "google":
        return GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=API_KEY
        )
    elif MODEL_PROVIDER == "openai":
        return OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=API_KEY
        )
    else:
        raise ValueError("Invalid MODEL_PROVIDER. Use 'google' or 'openai'.")