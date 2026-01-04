import autogen
from autogen import AssistantAgent, UserProxyAgent
from autogen.agentchat.contrib.retrieve_user_proxy_agent import RetrieveUserProxyAgent
import os
import json

llm_config = {
    "config_list": [
        {
            "model": "gemini-1.5-flash",
            "api_key": "AIzaSyC2pAteRgVqwGJnrc0APbillQzi__A4g7E",  
            "api_type": "google"
        }
    ],
}

assist = AssistantAgent(
    name="assistant",
    system_message="You are a helpful assistant.",
    llm_config=llm_config,
)

ragproxyagent = RetrieveUserProxyAgent(
    name="ragproxyagent",
    retrieve_config={
        "task": "qa",
        "docs_path": "https://api.artic.edu/api/v1/swagger.json"
    }
)

ragproxyagent.reset()

ragproxyagent.initiate_chat(
    assist,
    message=ragproxyagent.message_generator,
    problem="What is the complete URL for fetching all the artworks whose metadata contains some mention of cats?"
)

url = assist.last_message()["content"]

with autogen.coding.DockerCommandLineCodeExecutor(image="python-image", work_dir="apifetching") as code_executor:
    assistant = AssistantAgent(
        "assistant",
        system_message="You are a python programmer. Writing and executing codes",
        llm_config=llm_config
    )

    user_proxy = UserProxyAgent(
        "user_proxy",
        code_execution_config={"executor": code_executor}
    )
    fetch_artworks_message = f"Fetch the all the artworks whose metadata contains some mention of cats from the following URL: {url} and save the data in a JSON file."

    response = user_proxy.initiate_chat(
        assistant,
        message= fetch_artworks_message
    )

   
  
