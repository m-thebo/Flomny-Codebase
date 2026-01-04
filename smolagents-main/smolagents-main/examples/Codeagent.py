from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

#code agent does all the actions in the form of code

#hence for fibonacci, it writes the code then runs it to get the answer

agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=HfApiModel(
    token="<api-key>",
))

agent.run("What is the 10th fibonacci number ?")