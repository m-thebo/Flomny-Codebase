import operator
from typing import TypedDict, List, Dict

from langchain_community.tools import TavilySearchResults
from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from typing_extensions import Optional, Literal, Any, Annotated
from workflow.base_models import WorkflowTask, RotatingGeminiLLM


class MainState(TypedDict):
    """Main state schema for the system"""
    user_prompt: str
    steps: List[str]
    refined_tasks: list[WorkflowTask]
    integrations: List[Dict[str, Any]]
    documentation_dir: str
    # refined_tasks_c: List[WorkflowTask] # refined tasks with codes coming after manager runs
    merged_code: str


class OrchState(TypedDict):
    """Enhanced graph state with validation context"""
    user_prompt: str
    integrations: List[Dict[str, Any]]
    judge_decision: Optional[Literal["approve", "needs_revision"]]
    validation_feedback: Optional[str]  # Unified feedback field

class ManagerState(TypedDict):
    tasks: Annotated[Dict[str, dict], operator.or_]
    results: Annotated[Dict[str, dict], operator.or_]
    current_task: Annotated[Optional[str], operator.add]
    errors: Annotated[Dict[str, str], operator.or_]
    documentation_dir: str

class IntegrationState(TypedDict):
    """Integration agent state schema"""
    # llm, can either be ChatGoogleGenerativeAI or ChatOpenAI
    llm: BaseChatModel
    web_tool: Optional[TavilySearchResults]
    task: WorkflowTask
    documentation_dir: str
    error: str
    messages: str
    generation: str
    source_descriptions: Optional[str]
    iterations: int
    confidence: Optional[int]
    docs_used: Optional[str]
    web_search_results: Optional[str]
    temperature: float
    output_description: str
