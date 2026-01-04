from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

#Can create URL using API Doc

agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=HfApiModel(
    token="<api-key>",
))

agent.run("What is the complete URL for fetching all the artworks whose metadata contains some mention of cats? using this API documentation: 'https://api.artic.edu/api/v1/swagger.json'")