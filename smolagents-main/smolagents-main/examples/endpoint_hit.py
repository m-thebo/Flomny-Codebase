from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

#CodeAgent can hit the endpoint

agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=HfApiModel(
    token="<api-key>",
))

agent.run("Hit the given API and get the artwork: 'https://api.artic.edu/api/v1/artworks/129884'")