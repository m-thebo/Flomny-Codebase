from langgraph.constants import START
from langgraph.graph import StateGraph, END
from langgraph.graph.state import CompiledStateGraph

from workflow.helpers import assess_confidence, retrieve_docs, generate, validate_code, decide_to_finish
from workflow.nodes import validation_node, task_breakdown_node, human_correction_node, refinement_agent, manager_agent
from workflow.states import MainState, IntegrationState
import os

def create_workflow() -> CompiledStateGraph:

    # Define your workflow graph
    workflow = StateGraph(MainState)

    # 1. Add Nodes
    workflow.add_node("validate", validation_node)
    workflow.add_node("human_correction", human_correction_node)
    workflow.add_node("task_breakdown", task_breakdown_node)
    workflow.add_node("refinement_agent", refinement_agent)
    workflow.add_node("manager_agent", manager_agent)

    # 2. Set Entry Point
    workflow.set_entry_point("validate")

    # 3. Add Conditional Edge
    workflow.add_conditional_edges(
        "validate",
        lambda state: "human_correction" if state.get("judge_decision") == "needs_revision" else "task_breakdown",
        {
            "human_correction": "human_correction",
            "task_breakdown": "task_breakdown"
        }
    )

    # 4. Add Edges for Correction Loop
    workflow.add_edge("human_correction", "validate")  # Loop back to validation
    workflow.add_edge("task_breakdown", "refinement_agent")  # Proceed to downstream tasks
    workflow.add_edge("refinement_agent", "manager_agent")
    workflow.add_edge("manager_agent", END)  # Proceed to downstream tasks

    # Compile the graph
    app = workflow.compile()
    try:
        image_path = os.path.join("./workflow", "Main_Workflow.png")
        app.get_graph().draw_mermaid_png(output_file_path=image_path)
        print(f"Graph saved to {image_path}")
    except Exception as e:
        print(f"Failed to save graph: {e}")

    return app

