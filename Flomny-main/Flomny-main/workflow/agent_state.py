from typing import TypedDict, List, Dict

class AgentState(TypedDict, total=False):
    user_prompt: str
    is_valid: bool
    validation_message: str
    task_breakdown: List[Dict[str, str]]
    integration_codes: Dict[str, str]
    generated_code: str
