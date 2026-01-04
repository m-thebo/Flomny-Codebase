import time
from uuid import UUID, uuid4
from typing import List, Optional

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field, PrivateAttr
from typing_extensions import Any


class WorkflowTask(BaseModel):
    task_id: UUID = Field(default_factory=uuid4, description="Auto-generated unique ID")
    action: str = Field(..., description="Action verb phrase")
    task_description: str = Field(..., description="Description of the task as inferred and extracted EXACTLY from the steps")
    integration: str = Field(..., description="Integration service name")
    parameters: dict = Field(..., description="Key-value pairs for API call")
    output_description: str = Field(
        default="",
        description="Description of the output this task provides for downstream nodes"
    )
    output_nodes: List[UUID] = Field(
        default_factory=list,
        description="List of target node UUIDs that receive this task's output"
    )

class RotatingGeminiLLM(BaseChatModel):
    """Rotates Gemini API keys with cooldown after full cycle"""
    # Pydantic fields (required for BaseChatModel)
    model_name: str = "gemini-pro"
    temperature: float = 0.7
    cooldown: int = 60  # Seconds between full cycles

    # Private attributes (not part of Pydantic model)
    _api_keys: List[str] = PrivateAttr()
    _current_key_index: int = PrivateAttr(default=0)
    api_keys: List[str] = []

    def __init__(self,
                 api_keys: List[str],
                 model_name: str = "gemini-pro",
                 temperature: float = 0.7,
                 cooldown: int = 30):
        super().__init__()
        self.api_keys = api_keys
        self._api_keys = api_keys
        self.model_name = model_name
        self.temperature = temperature
        self.cooldown = cooldown  # Seconds between full cycles
        self._current_key_index = 0

    def _generate(self, messages: List[HumanMessage],
                  stop: Optional[List[str]] = None,
                  **kwargs: Any):
        while True:
            current_key = self._api_keys[self._current_key_index]
            try:
                llm = ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=current_key,
                    temperature=self.temperature
                )
                return llm._generate(messages, stop=stop, **kwargs)
            except Exception as e:
                if "quota" in str(e).lower() or "exceeded" in str(e).lower():
                    prev_index = self._current_key_index
                    self._rotate_key()
                    self._handle_full_cycle(prev_index)
                else:
                    raise e

    def _rotate_key(self):
        """Move to next key and track rotation"""
        print(f"Rotating from key {self._current_key_index}")
        self._current_key_index = (self._current_key_index + 1) % len(self._api_keys)

    def _handle_full_cycle(self, previous_index: int):
        """Trigger cooldown after complete key cycle"""
        if previous_index == len(self._api_keys) - 1:
            print(f"All keys tried. Cooling down for {self.cooldown}s...")
            time.sleep(self.cooldown)
            print("Restarting key rotation from first key")

    @property
    def _llm_type(self) -> str:
        return "rotating_gemini"
