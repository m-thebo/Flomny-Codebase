from prompts.prompts import VALIDATION_PROMPT, TASK_BREAKDOWN_PROMPT, INTEGRATION_PROMPTS, MERGE_PROMPT
from llm.llm import get_llm
from workflow.agent_state import AgentState

llm = get_llm()

def validation_node(state: AgentState) -> AgentState:
    print("\nNODE (IN VALIDATION NODE)")
    messages = VALIDATION_PROMPT.format_messages(user_prompt=state["user_prompt"])
    response = llm.invoke(messages)
    return {
        "is_valid": response.content.strip().lower() == 'valid',
        "validation_message": "Valid workflow" if response.content.strip().lower() == 'valid'
        else "Only use: Gmail, Google Drive, Discord, Slack, Facebook"
    }

def task_breakdown_node(state: AgentState) -> AgentState:
    print("\nNODE (IN TASK BREAK DOWN NODE)")
    messages = TASK_BREAKDOWN_PROMPT.format_messages(user_prompt=state["user_prompt"])
    response = llm.invoke(messages)

    breakdown = []
    for line in response.content.strip().split('\n'):
        if 'Integration:' in line and 'Task:' in line:
            parts = line.split('Task:')
            integration = parts[0].split('Integration:')[-1].strip()
            task = parts[-1].strip()
            breakdown.append({"integration": integration, "task": task})

    print("\nTask Breakdown: ", breakdown)
    return {"task_breakdown": breakdown}

def integration_code_node(state: AgentState) -> AgentState:
    print("\nNODE (IN INTEGRATION NODE - )")
    integration_codes = {}
    for task in state["task_breakdown"]:
        integration = task["integration"].replace(",", "")
        print(f"\nNODE (IN INTEGRATION NODE - {integration})")
        if integration not in INTEGRATION_PROMPTS:
            continue
        prompt = INTEGRATION_PROMPTS[integration].format_messages(task=task["task"])
        response = llm.invoke(prompt)
        code = response.content.strip()

        # Clean code blocks
        if "```python" in code:
            code = code.split("```python")[1].split("```")[0]
        elif code.startswith("```"):
            code = code[4:-3].strip()

        integration_codes[integration] = code.strip()
    return {"integration_codes": integration_codes}

def merge_code_node(state: AgentState) -> AgentState:
    print("\nNODE (IN MERGE CODE NODE)")
    code_snippets = "\n\n".join(
        [f"# {intg} Code\n{code}"
         for intg, code in state["integration_codes"].items()]
    )

    messages = MERGE_PROMPT.format_messages(
        code_snippets=code_snippets,
        user_prompt=state["user_prompt"]
    )
    response = llm.invoke(messages)

    merged_code = response.content.strip()
    if "```python" in merged_code:
        merged_code = merged_code.split("```python")[1].split("```")[0]
    elif merged_code.startswith("```"):
        merged_code = merged_code[4:-3].strip()

    return {"generated_code": merged_code}

def error_node(state: AgentState) -> AgentState:
    print("\nNODE (IN ERROR NODE)")
    return {"validation_message": state["validation_message"]}
