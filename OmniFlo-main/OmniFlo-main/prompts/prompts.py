from langchain_core.prompts import ChatPromptTemplate

# Validation and task breakdown prompts
VALIDATION_PROMPT_IMENTIONED = ChatPromptTemplate.from_messages([
    ("system", """Identify which of these integrations are mentioned: {integrations}
        Respond with COMMA-SEPARATED LIST or 'NONE'."""),
    ("human", "{user_prompt}")
])

VALIDATION_PROMPT_MSENSE = ChatPromptTemplate.from_messages([
    ("system", """Does this query specify a clear action/task for integrations?
        Respond ONLY 'YES' or 'NO'."""),
    ("human", "{user_prompt}")
])

TASK_BREAKDOWN_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """"You are a workflow-planning assistant. Your task is to create a detailed, step-by-step workflow plan 
    for automating tasks based on the user's prompt and available integrations.
    Use ONLY these integrations: {integrations}
    
    Key Requirements: \n
    - Each step MUST correspond to an integration from the provided list. No other integration.\n"
    - Steps should be as verbose and detailed as possible.\n"
    - If a step requires multiple actions (e.g., fetching data and processing it), split these into separate steps. Still corresponding to an integration from the provided list.\n"
    - Include enough detail in each step so that an agent using the integration and its documentation can implement it without ambiguity.\n"
    - Only use the integrations provided. Do not assume other integrations are available.\n\n"
    - If missing integrations make workflow impossible, leave steps empty\n\n"
    
    Output Format (JSON only):\n"
    {{\n"
      \"steps\": [\n"
           \"1. Describe the first action related to an integration. (Integration: Specify the integration being used)\",\n"
           \"2. Describe the next action related to a different integration or the same one. (Integration: Specify the integration being used)\",\n"
           \"3. Continue with further actions as needed. (Integration: Specify the relevant integration)\",\n"
         ...]\n"
    }}"""),
    ("human", "Task: {user_prompt}\n\nProvide a well-explained answer.")
])

REFINEMENT_AGENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Convert workflow steps into structured tasks with output descriptions. Use DESCRIPTIVE ACTION_NAMES for references:
    For each step:
    1. Use exact integration names from: {integrations}
    2. Extract API parameters from step text
    3. Clearly identify parallel actions and their required inputs
    4. Ensure AT ALL COSTS that there is NO disconnection, in that, every action/node MUST have at least ONE node outputting to it

    Available Integrations:
    {integrations}

    Current Steps:
    {steps}

    Output JSON template:
    {{
        "tasks": [
            {{
                "action": "Action 1",
                "task_description": "Description of the task as EXACTLY inferred and extracted from the steps THEMSELVES",
                "integration": "Slack",
                "parameters": {{...}},
                "output_nodes": ["Action 2"]
            }},
            {{
                "action": "Action 2",
                ...
            }}
        ]
    }}"""),
    ("human", "Generate tasks from the steps")
])


# Integration-specific code generation prompts
# INTEGRATION_PROMPTS = {
#     "Gmail": ChatPromptTemplate.from_messages([
#         ("system", """You are a Gmail integration expert. Write Python code to:
# 1. {task}
# 2. Use <Gmail:Placeholder Name for info to add> for missing info
# 3. Include error handling
# 4. Return ONLY code"""),
#     ("human", "Complete the task")
#     ]),
#     "Google Drive": ChatPromptTemplate.from_messages([
#         ("system", """You are a Google Drive expert. Write Python code to:
# 1. {task}
# 2. Use <GoogleDrive:Placeholder Name for info to add> for missing info
# 3. Include error handling
# 4. Return ONLY code"""),
#     ("human", "Complete the task")
#     ]),
#     "Discord": ChatPromptTemplate.from_messages([
#         ("system", """You are a Discord bot developer. Write Python code to:
# 1. {task}
# 2. Use <Discord:Placeholder Name for info to add> for missing info
# 3. Include error handling
# 4. Return ONLY code"""),
#     ("human", "Complete the task")
#     ]),
#     "Slack": ChatPromptTemplate.from_messages([
#         ("system", """You are a Slack API expert. Write Python code to:
# 1. {task}
# 2. Use <Slack:Placeholder Name for info to add> for missing info
# 3. Include error handling
# 4. Return ONLY code"""),
#     ("human", "Complete the task")
#     ]),
#     "Facebook": ChatPromptTemplate.from_messages([
#         ("system", """You are a Facebook API specialist. Write Python code to:
# 1. {task}
# 2. Use <Facebook:Placeholder Name for info to add> for missing info
# 3. Include error handling
# 4. Return ONLY code"""),
#     ("human", "Complete the task")
#     ])
# }

# Integration-specific code generation prompts
CONFIDENCE_PROMPT = ChatPromptTemplate.from_messages([
        ("system", """Rate your confidence (0-10) in creating {action} for {name} integration. 
        Consider: API knowledge, parameter understanding ({parameters}), and documentation need.
        Respond ONLY with the confidence number enclosed in ||."""),
        ("placeholder", "{messages}")
    ])

GENERATION_PROMPT = ChatPromptTemplate.from_messages([
        ("system", """You are an expert in the domain of the {name} integration; generating code. Your task is to create the {action} for the integration. Follow these steps:

        PREFACE:
        A. Use and do EXACTLY what the context tells you to or gives you
        B. The parameters provided are actual parameters that can be used and are not for examples or dummy
        C. ENSURE ALL IMPORTS ARE INCLUDED WHEN WRITING THE CODE, DOUBLE-CHECK
        D. Check the validation feedback if available to fix anything.

        RULES:
        1. From the context below, identify ALL parameters needed for this action.
        2. Compare with available parameters: {parameters}, use the provided parameters wherever needed
        3. Include error handling
        4. Return ONLY code

        Documentation:
        {context}

        All of the previous nodes' output descriptions into this node, discard the ones that are not relevant to the task you have:
        {source_descriptions}

        Extra task description:
        {task_description}
         """),
        ("user",
         "IMPORTANT: For MISSING required parameters only, create placeholders strictly like {name_upper}:PARAM_NAME \n Messages so far: {messages}"),
    ])

DESC_PROMPT = ChatPromptTemplate.from_messages([
        ("system", """Generate ONLY A TEXT DESCRIPTION (NO CODE) of outputs for downstream tasks based on the code generated. Follow these rules:
        [RULES]:
        1. NEVER include code/markdown
        2. Describe data formats/structure
        3. Use plain English only
        4. Maximum 2 sentences
        [/RULES]

        - Context: {context}
        - Parameters: {parameters}


        """),
        ("user", "Here's the generated code:\n{generated_code}\n")
    ])

VALIDATOR_PROMPT = ChatPromptTemplate.from_messages([
        ("system", """You are an expert {name} API code validator. Analyze this code for {action} using {name} API. You would follow the "IMPORTANT" decision strictly. And the Output format as well, you would start off with mentioning that.

        READ FIRST: IGNORE ALL PLACEHOLDERS. Their format: {name_upper}:PARAM_NAME

        Respond ONLY with, mention this FIRST thing:
        - "CODE:VALID" if the code looks correct. DO NOT EXPLAIN ANYTHING.
        - "CODE:INVALID" and a list of issues IF AND ONLY IF problems are found.

        Check ONLY for:
        1. Missing imports, IF needed
        2. Incorrect parameter usage
        3. Logical errors

        Provided parameters:
        {parameters}

        """),
        ("user", "\n Code: {code} \n Messages so far: {messages}")
    ])


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