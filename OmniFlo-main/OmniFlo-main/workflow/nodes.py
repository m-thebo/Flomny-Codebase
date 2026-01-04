import json
import os
from collections import defaultdict
from langchain_community.tools import TavilySearchResults
from langchain_core.output_parsers import StrOutputParser
from langgraph.constants import START, END
from langgraph.graph.state import CompiledStateGraph, StateGraph
from config.config import API_KEYS
from workflow.base_models import RotatingGeminiLLM
from workflow.helpers import resolve_connections, validate_connections, uuid_serializer, assess_confidence, \
    retrieve_docs, generate, validate_code, decide_to_finish
from prompts.prompts import VALIDATION_PROMPT_IMENTIONED, VALIDATION_PROMPT_MSENSE, TASK_BREAKDOWN_PROMPT, \
    REFINEMENT_AGENT_PROMPT
from llm.llm import get_llm
from workflow.states import OrchState, MainState, IntegrationState, ManagerState

llm = get_llm()
m_llm = RotatingGeminiLLM(
    api_keys=API_KEYS,
    model_name="gemini-2.0-flash-exp",
    temperature=0.7  # Default temperature
)

def validation_node(state: MainState) -> OrchState:
    print("\nNODE (IN VALIDATION NODE)")
    integration_names = [i['name'] for i in state["integrations"]]
    feedback = []
    integ_mentioned = VALIDATION_PROMPT_IMENTIONED.format_messages(user_prompt=state["user_prompt"], integrations=integration_names)
    llm_chain = llm | StrOutputParser()
    feedback_1 = llm_chain.invoke(integ_mentioned)
    # print(type(feedback_1))
    #
    # print("Feedback 1:", feedback_1)
    if feedback_1.lower() == "none":
        feedback.append("No recognized integrations mentioned")
    else:
        # Verify at least one valid integration
        valid_mentions = [
            i.strip() for i in feedback_1.split(",")
            if i.strip().lower() in [n.lower() for n in integration_names]
        ]
        if not valid_mentions:
            feedback.append(f"Unavailable integrations: {feedback_1}")

    integ_msense = VALIDATION_PROMPT_MSENSE.format_messages(user_prompt=state["user_prompt"])
    feedback_2 = llm_chain.invoke(integ_msense)

    if "no" in feedback_2.lower():
        feedback.append("No clear task specified - what should the integration(s) DO?")

    if feedback:
        return {
            "user_prompt": state["user_prompt"],
            "validation_feedback": "\n".join(feedback),
            "integrations": state["integrations"],
            "judge_decision": "needs_revision"
        }

    return {
        "user_prompt": state["user_prompt"],
        "validation_feedback": "",
        "integrations": state["integrations"],
        "judge_decision": "approve"
    }

def human_correction_node(state: OrchState) -> OrchState:
    """
    Universal correction node that updates the query differently based on the stage:

    - In the pre-retrieval stage (validation_type == "pre_retrieval"), the human revision updates both
      the current query and the original query.

    - In the post-retrieval stage (validation_type is not "pre_retrieval"), only the current query is updated,
      preserving the original query (which is used to determine if a full restart is needed).
    """
    print("\n--- PRE-CHECKS FAILED ---")
    print("Your query must meet basic requirements before processing:")


    print("Feedback:", state["validation_feedback"])
    print(f"\nCurrent query: {state['user_prompt']}")


    revision = input("\nRevise your query (Enter to keep current version): ").strip()
    if revision:
        # For pre-retrieval, update both original and current query.
        state["user_prompt"] = revision

    # Reset validation fields
    state["validation_feedback"] = ""
    state["judge_decision"] = None

    return state

def task_breakdown_node(state: OrchState) -> MainState:
    print("\nNODE (IN TASK BREAK DOWN NODE)")

    # Integration names, details, and types
    integration_ndt = [
        (i["name"], i["description"], i["category"])
        for i in state["integrations"]
    ]

    messages = TASK_BREAKDOWN_PROMPT.format_messages(user_prompt=state["user_prompt"], integrations=integration_ndt)
    llm_chain = llm | StrOutputParser()
    response = llm_chain.invoke(messages)

    # Parse the output and extract only the steps.
    # try:
    # Remove any markdown fencing and parse the JSON
    gen_str = response.strip().strip("```").strip("json")
    print(f"Generation output: {gen_str}")
    gen_json = json.loads(gen_str)
    steps: list[str] = gen_json.get("steps", [])
    # except Exception as e:
    #     print(f"Error parsing generation output: {e}")
    #     steps = response  # Fallback to raw output if parsing fails
    print("\nTask Breakdown: ", steps)
    return {**state, "steps": steps}

def refinement_agent(state: MainState) -> MainState:
    print("\nNODE (IN REFINEMENT AGENT NODE)")
    integration_names = [i['name'] for i in state["integrations"]]

    messages = REFINEMENT_AGENT_PROMPT.format_messages(integrations=integration_names, steps=state["steps"])

    llm_chain = llm | StrOutputParser()
    response = llm_chain.invoke(messages)
    #
    # chain = (
    #         RunnablePassthrough.assign(
    #             steps=lambda x: "\n".join(x["generation"]["steps"]),
    #             integrations=lambda x: ", ".join([i["name"] for i in x["integrations"]]),
    #             docs=lambda x: "\n".join([doc["content"] for doc in x["documents"]])
    #         )
    #         | prompt
    #         | llm
    #         | StrOutputParser()
    # )

    raw_output = response.strip().removeprefix("```json").removesuffix("```").strip()

    try:
        tasks_data = json.loads(raw_output)
        tasks_list = tasks_data.get("tasks", [])
        refined_tasks = resolve_connections(tasks_list)
        validate_connections(refined_tasks)

        state["refined_tasks"] = refined_tasks
        print("Refined tasks with output descriptions:")
        print(json.dumps([t.model_dump(mode='json') for t in refined_tasks], indent=2, default=uuid_serializer))

    except json.JSONDecodeError as e:
        print(f"Failed to parse LLM output: {e}")
        state["refined_tasks"] = []

    return state

def manager_agent(state: MainState) -> CompiledStateGraph:
    """
           Creates a manager agent that orchestrates integration agents based on the task list.
    """

    print("\nNODE (IN MANAGER AGENT NODE)")

    print("Refined tasks:")
    print(json.dumps([t.model_dump(mode='json') for t in state["refined_tasks"]], indent=2, default=uuid_serializer))

    task_list = state["refined_tasks"]
    task_list = [t.model_dump(mode='json') for t in task_list]
    task_map = {task["task_id"]: task for task in task_list}
    dependency_map = {task["task_id"]: task["output_nodes"] for task in task_list}

    reverse_dep_map = defaultdict(list)
    for task in task_list:
        for output_node in task["output_nodes"]:
            reverse_dep_map[output_node].append(task["task_id"])

    integration_apps = {}
    for task in task_list:
        print(task)
        # docs_key = (task["integration"], task["action"])
        documentation_dir = state["documentation_dir"]

        app = create_integAgent(task)
        integration_apps[task["task_id"]] = app

    workflow = StateGraph(ManagerState)

    def run_task(task_id: str):
        def task_node(state: ManagerState):
            state = {
                "tasks": {t["task_id"]: t for t in task_list},
                "results": {},
                "current_task": "",
                "errors": {}
            }

            print(f"\n--- PROCESSING TASK {task_id} ---")
            if state.get("tasks") is None:
                state["tasks"] = {}
            if state.get("results") is None:
                state["results"] = {}

            app = integration_apps[task_id]
            # print(state["tasks"][task_id]["task_id"])
            source_tasks = reverse_dep_map[state["tasks"][task_id]["task_id"]]
            print(f"Source tasks: {source_tasks}")
            source_descriptions = [state["tasks"][t]["output_description"] for t in source_tasks]
            print(f"Source descriptions: {source_descriptions}")

            new_llm = RotatingGeminiLLM(
                api_keys=m_llm.api_keys,
                model_name=m_llm.model_name,
                temperature=0.0
            )

            initial_state = {
                "llm": new_llm,
                "web_tool": TavilySearchResults(),
                "task": task_map[task_id],
                "documentation_dir": documentation_dir,
                "error": "no",
                "messages": [("user", f"Action: {task_map[task_id]['action']}")],
                "generation": None,
                "source_descriptions": source_descriptions,
                "iterations": 0
            }

            # try:
            result = app.invoke(initial_state)
            if (generation := result.get("generation")):
                state["tasks"][task_id]["code"] = generation
                state["results"][task_id] = {"status": "code_generated"}

            if (output_description := result.get("output_description")):
                print(f"Output description found: {output_description}")
                state["tasks"][task_id]["output_description"] = output_description

            state["errors"].pop(task_id, None)

            return state

        return task_node

    for task_id in task_map:
        workflow.add_node(task_id, run_task(task_id))

    for task in task_list:
        source_id = task["task_id"]
        for target_id in task["output_nodes"]:
            workflow.add_edge(source_id, target_id)

    all_targets = set()
    for edges in dependency_map.values():
        all_targets.update(edges)
    start_nodes = [t["task_id"] for t in task_list if t["task_id"] not in all_targets]
    for node in start_nodes:
        workflow.add_edge(START, node)

    end_nodes = [t["task_id"] for t in task_list if not t["output_nodes"]]
    for node in end_nodes:
        workflow.add_edge(node, END)


    app = workflow.compile()
    try:
        image_path = os.path.join("./workflow", "Manager_Workflow.png")
        app.get_graph().draw_mermaid_png(output_file_path=image_path)
        print(f"Graph saved to {image_path}")
    except Exception as e:
        print(f"Failed to save graph: {e}")
    return app


def create_integAgent(task: dict) -> CompiledStateGraph:
    # Initialize web search tool if API key provided
    # tavily_api_key = config.get("TAVILY_API_KEY")
    # Set the environment variable for Tavily
    print(f"\nNODE (IN {task['integration']} AGENT NODE)")

    # name = task["integration"]
    # action = task["action"]
    # parameters = task["parameters"]
    # # output_desc = task.get("output_description", "")
    # task_description = task.get("task_description", "")
    # # source_descriptions = prev_out_desc

    app = create_integration_agent_workflow()

    return app

def create_integration_agent_workflow() -> CompiledStateGraph:
    # Build simplified workflow
    workflow = StateGraph(IntegrationState)
    workflow.add_node("assess_confidence", assess_confidence)
    workflow.add_node("retrieve_docs", retrieve_docs)
    workflow.add_node("generate", generate)
    workflow.add_node("validate_code", validate_code)

    # Set up edges
    workflow.add_edge(START, "assess_confidence")
    workflow.add_edge("assess_confidence", "retrieve_docs")
    workflow.add_edge("retrieve_docs", "generate")
    workflow.add_edge("generate", "validate_code")

    # Conditional edges for retry logic
    workflow.add_conditional_edges(
        "validate_code",
        decide_to_finish,
        {"end": END, "generate": "generate"},
    )

    # Compile the graph
    app = workflow.compile()
    try:
        image_path = os.path.join("./workflow", "IA_Workflow.png")
        app.get_graph().draw_mermaid_png(output_file_path=image_path)
        print(f"Graph saved to {image_path}")
    except Exception as e:
        print(f"Failed to save graph: {e}")

    return app