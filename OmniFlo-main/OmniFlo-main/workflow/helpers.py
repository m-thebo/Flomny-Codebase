import json
import re
from uuid import UUID, uuid4
from typing import List, Optional
import hashlib

from langchain_core.output_parsers import StrOutputParser

from prompts.prompts import CONFIDENCE_PROMPT, GENERATION_PROMPT, DESC_PROMPT, VALIDATOR_PROMPT
from workflow.base_models import WorkflowTask, RotatingGeminiLLM
from workflow.states import IntegrationState


def uuid_serializer(obj):
    if isinstance(obj, UUID):
        return str(obj)
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


def deterministic_uuid(action: str) -> UUID:
    return UUID(bytes=hashlib.sha256(action.encode()).digest()[:16], version=4)


def resolve_connections(raw_tasks: List[dict]) -> List[WorkflowTask]:
    '''
    Assign consistent UUIDs to actions like "Authenticate Slack" and "Validate Channel".
    Replace the "Validate Channel" action name reference in "output_nodes" with its corresponding UUID.
R   Return structured tasks linked via UUIDs.
    '''
    action_map = {t["action"]: deterministic_uuid(t["action"]) for t in raw_tasks}
    refined_tasks = []

    for task in raw_tasks:
        output_node_actions = task.get("output_nodes", [])
        output_node_uuids = []
        for action_name in output_node_actions:
            if resolved_uuid := action_map.get(action_name):
                output_node_uuids.append(resolved_uuid)
            else:
                print(f"Warning: Undefined output action {action_name}")

        refined_task = WorkflowTask(
            task_id=action_map[task["action"]],
            output_description=task.get("output_description", ""),
            output_nodes=output_node_uuids,
            **{k: v for k, v in task.items() if k not in ["output_nodes", "output_description"]}
        )
        refined_tasks.append(refined_task)

    return refined_tasks


def validate_connections(tasks: List[WorkflowTask]):
    valid_actions = {t.task_id for t in tasks}
    for task in tasks:
        for target_uuid in task.output_nodes:
            if target_uuid not in valid_actions:
                raise ValueError(f"Invalid output reference: {target_uuid}")

# Integration agent helpers

def assess_confidence(state: IntegrationState):
    """Node to assess LLM's confidence level"""
    print("---ASSESSING CONFIDENCE---")

    action = state["task"]["action"]
    name = state["task"]["integration"]
    parameters = state["task"]["parameters"]
    llm = state["llm"]

    # Create a low-temperature LLM for confidence assessment
    temp_llm = RotatingGeminiLLM(
        api_keys=llm.api_keys,
        model_name=llm.model_name,
        temperature=0.0  # Set temp to 0.0
    )
    # Confidence assessment chain
    confidence_chain = CONFIDENCE_PROMPT | temp_llm | StrOutputParser()

    response = confidence_chain.invoke({
        "action": action,
        "name": name,
        "parameters": parameters,
        "messages": state["messages"]
    })

    # Extract confidence score using regex
    match = re.search(r'\|\|(\d+)\|\|', response)
    confidence = int(match.group(1)) if match else 5  # Default to medium confidence

    temp = 0.0

    return {**state, "confidence": confidence, "temperature": temp}

def retrieve_docs(state: IntegrationState):
    """Node to retrieve documentation based on confidence"""
    print(f"---RETRIEVING DOCS (Confidence: {state['confidence']})---")
    context = ""
    web_results = ""
    documentation_dir = state["documentation_dir"]
    name = state["task"]["integration"]
    action = state["task"]["action"]
    parameters = state["task"]["parameters"]
    task_description = state["task"]["task_description"]
    web_search_tool = state["web_tool"]

    # Low-Medium confidence (0-6)
    if 0 <= state['confidence'] <= 6:
        try:
            if documentation_dir:
                # Attempt local docs first
                context = f"Local documentation: {documentation_dir}/{name}_docs.json"
        except Exception as e:
            print(f"Error loading local docs: {e}")
            context = ""

        # If no local docs found, proceed to web search
        if not context:
            if state['confidence'] <= 4:
                # Low confidence (0-4): Full web search
                query = f"{name} API {action} documentation - {task_description}"
                web_results = web_search_tool.invoke(query)
                context = f"Use ONLY THESE Web results: {web_results[:1000]}"
            else:
                # Medium confidence (5-6): Focused web search
                query = f"{name} API {action} {parameters} - {task_description}"
                web_results = web_search_tool.invoke(query)
                context = f"Supplemental context: {web_results[:500]}"
    # High confidence (7+)
    else:
        context = "Using internal knowledge base"


    return {**state, "docs_used": context, "web_search_results": web_results}

def generate(state: IntegrationState):
    """Generate code solution with parameter validation and placeholders"""
    print("---GENERATING CODE SOLUTION WITH PARAMETER VALIDATION---")

    docs_context = state["docs_used"]
    messages = state["messages"]
    error = state["error"]
    action = state["task"]["action"]
    name = state["task"]["integration"]
    parameters = state["task"]["parameters"]
    task_description = state["task"]["task_description"]
    temp_llm = state["llm"]

    print(docs_context)


    print(f"Temperature set to: {state['temperature']}")
    # Create parameter validation chain

    # Get base parameters
    base_params = {
        "context": docs_context,
        "action": action,
        "messages": messages,
        "name": name,
        "name_upper": name.upper(),
        "source_descriptions": state["source_descriptions"],
        "task_description": task_description,
        "parameters": json.dumps(parameters, indent=2)
    }
    # We have been routed back to generation with an error
    if error == "yes":
        messages += [
            (
                "user",
                "Now, try again. Re-write the code, considering the errors, with the imports and code block:",
            )
        ]


    # Create chains
    desc_chain = DESC_PROMPT | temp_llm | StrOutputParser()
    param_validation_chain = GENERATION_PROMPT | temp_llm | StrOutputParser()

    # Generate code
    code_solution = None
    try:
        code_response = param_validation_chain.invoke(base_params)
        # Robust code extraction
        code_solution = code_response
    except Exception as e:
        print(f"Code generation failed: {e}")

    # Generate description
    output_description = ""
    try:
        desc_response = desc_chain.invoke({
            "messages": messages,
            "name": name,
            "generated_code": code_solution,
            "context": docs_context,
            "parameters": json.dumps(parameters, indent=2)
        })
        # Robust description extraction
        output_description = desc_response
    except Exception as e:
        print(f"Description generation failed: {e}")

    # print code
    print(f"Generated code: \n{code_solution}")
    task_id = state["task"]["task_id"]
    print(f"Output Description {task_id}: {output_description}")

    # Handle generation failures
    if not code_solution:
        error_msg = "Failed to generate code with parameter validation"
        return {
            "generation": None,
            "messages": state["messages"] + [("assistant", error_msg)],
            "iterations": state["iterations"] + 1,
            "error": "yes"
        }

    # Update state
    messages += [
        ("assistant", f"Generated Code: {code_solution}\n"),
        ("assistant", f"Output Description:\n{output_description}")
    ]

    return {
        "generation": code_solution,
        "messages": messages,
        "iterations": state["iterations"] + 1,
        "error": "no",
        "output_description": output_description  # Explicitly include
    }

def validate_code(state: IntegrationState):
    """Node to validate generated code without execution"""
    print("---VALIDATING CODE---")
    code_solution = state["generation"]
    # print(f"Generated code: {code_solution}")
    messages = state["messages"]
    docs_context = state["docs_used"]
    action = state["task"]["action"]
    name = state["task"]["integration"]
    parameters = state["task"]["parameters"]
    llm = state["llm"]


    # Combine prefix, imports, and code for validation
    # full_code = f"{code_solution.prefix}\n{code_solution.imports}\n{code_solution.code}"
    full_code = f"{code_solution}"

    temp_llm = RotatingGeminiLLM(
        api_keys=llm.api_keys,
        model_name=llm.model_name,
        temperature=0.0
    )

    # Validator chain
    validator_chain = VALIDATOR_PROMPT | temp_llm | StrOutputParser()

    # Validate the code
    validation_result = validator_chain.invoke({
        "action": action,
        "name": name,
        "code": full_code,
        "messages": state["messages"],
        "parameters": json.dumps(parameters, indent=2),
        "docs_context": docs_context,
        "name_upper": name.upper()
    })

    # print(validation_result)
    if "CODE:VALID" in validation_result or validation_result == "":
        print("---CODE VALIDATION PASSED---")
        return {**state, "error": "no"}
    else:
        print(f"---CODE VALIDATION FAILED: {validation_result}---")
        messages += [("user", f"Validation issues found: {validation_result}")]
        return {**state, "error": "yes", "messages": messages}

def decide_to_finish(state: IntegrationState):
    """Determine whether to finish or retry"""
    if state["error"] == "no" or state["iterations"] >= 3:
        print("STATES: ", state["error"], state["iterations"])
        print("---DECISION: FINISH---")
        return "end"
    elif state["error"] == "yes":
        print("---DECISION: RE-TRY SOLUTION---")
        return "generate"