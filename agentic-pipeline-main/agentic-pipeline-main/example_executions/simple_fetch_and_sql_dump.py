import autogen
from autogen import AssistantAgent, UserProxyAgent

# Human input is need to move forward and exit. This behaviour can be modified but haven't changed it to keep it simple.
# Code that this code created is saved in example_executions/simple_fetch_and_sql_dump folder along with the fetched data.

config_list_gemini = autogen.config_list_from_json(
    "config.json",
    filter_dict={
        "model": ["gemini-1.5-flash"],
    },
)

sample_database_credentials = """
    host = ''
    user = ''  
    password = '' 
    database = ''  
    port =   
"""

with autogen.coding.DockerCommandLineCodeExecutor(image="shehzadaslamoza/multiagent-python",work_dir="example_executions/simple_fetch_and_sql_dump") as code_executor:
    assistant = AssistantAgent("assistant", system_message="You are a python programmer. Writing and executing codes", llm_config={"config_list": config_list_gemini})
    user_proxy = UserProxyAgent(
        "user_proxy", code_execution_config={"executor": code_executor}
    )

    # Start the chat
    user_proxy.initiate_chat(
        assistant,
        message=f"first 10 posts of https://jsonplaceholder.typicode.com/posts/[post_number] and save the data into sql database depending on the structure. Use these credentials {sample_database_credentials}. Create table and insert the data.",
    )