from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel
#Can hit endpoints using API doc

agent = CodeAgent(tools=[DuckDuckGoSearchTool()],additional_authorized_imports=['json','requests'], model=HfApiModel(
    token="<api-key>",
), max_steps=50)

agent.run("Fetch the all the artworks whose metadata contains some mention of cats . Given: 'https://api.artic.edu/api/v1/swagger.json'")