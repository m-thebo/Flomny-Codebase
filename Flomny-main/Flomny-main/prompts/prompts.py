from langchain_core.prompts import ChatPromptTemplate

# Validation and task breakdown prompts
VALIDATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Analyze if the request uses ONLY: Gmail, Google Drive, Discord, Slack, Facebook. 
    Respond ONLY 'valid' or 'invalid'."""),
    ("human", "{user_prompt}")
])

TASK_BREAKDOWN_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Break the workflow into integration steps. List each step as:
    'Integration: <NAME> e.g Gmail Discord [Singular Integration ONLY], Task: <ACTION> Related to this integration only'
    Use ONLY: Gmail, Google Drive, Discord, Slack, Facebook"""),
    ("human", "{user_prompt}")
])

# Integration-specific code generation prompts
INTEGRATION_PROMPTS = {
    "Gmail": ChatPromptTemplate.from_messages([
        ("system", """You are a Gmail integration expert. Write Python code to:
1. {task}
2. Use <Gmail:Placeholder Name for info to add> for missing info
3. Include error handling
4. Return ONLY code"""),
    ("human", "Complete the task")
    ]),
    "Google Drive": ChatPromptTemplate.from_messages([
        ("system", """You are a Google Drive expert. Write Python code to:
1. {task}
2. Use <GoogleDrive:Placeholder Name for info to add> for missing info
3. Include error handling
4. Return ONLY code"""),
    ("human", "Complete the task")
    ]),
    "Discord": ChatPromptTemplate.from_messages([
        ("system", """You are a Discord bot developer. Write Python code to:
1. {task}
2. Use <Discord:Placeholder Name for info to add> for missing info
3. Include error handling
4. Return ONLY code"""),
    ("human", "Complete the task")
    ]),
    "Slack": ChatPromptTemplate.from_messages([
        ("system", """You are a Slack API expert. Write Python code to:
1. {task}
2. Use <Slack:Placeholder Name for info to add> for missing info
3. Include error handling
4. Return ONLY code"""),
    ("human", "Complete the task")
    ]),
    "Facebook": ChatPromptTemplate.from_messages([
        ("system", """You are a Facebook API specialist. Write Python code to:
1. {task}
2. Use <Facebook:Placeholder Name for info to add> for missing info
3. Include error handling
4. Return ONLY code"""),
    ("human", "Complete the task")
    ])
}

# Merge prompt
MERGE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Combine these code snippets into a cohesive workflow:
{code_snippets}

Requirements:
1. Create a main function that connects all components
2. Add shared error handling
3. MUST Use all placeholder variables from code snippets.  For missing information, use <Integration Name:Placeholder Name for info to add> format
4. Include necessary imports
5. Make sure all the indenting and linting is correct
6. Return ONLY the final code"""),
    ("human", "Original request: {user_prompt}")
])
