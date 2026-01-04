from langgraph.graph import StateGraph, END
from workflow.nodes import validation_node, task_breakdown_node, integration_code_node, merge_code_node, error_node
from workflow.agent_state import AgentState
import os
def create_workflow() -> StateGraph:
    workflow = StateGraph(AgentState)

    workflow.add_node("validator", validation_node)
    workflow.add_node("task_analyzer", task_breakdown_node)
    workflow.add_node("integration_coder", integration_code_node)
    workflow.add_node("code_merger", merge_code_node)
    workflow.add_node("error_handler", error_node)

    workflow.set_entry_point("validator")

    workflow.add_conditional_edges(
        "validator",
        lambda s: "task_analyzer" if s.get("is_valid") else "error_handler"
    )

    workflow.add_conditional_edges(
        "task_analyzer",
        lambda s: "integration_coder" if s.get("task_breakdown") else "error_handler"
    )

    workflow.add_edge("integration_coder", "code_merger")
    workflow.add_edge("code_merger", END)
    workflow.add_edge("error_handler", END)
    app = workflow.compile()
    try:
        image_path = os.path.join("./workflow", "_.png")
        app.get_graph().draw_mermaid_png(output_file_path=image_path)
        print(f"Graph saved to {image_path}")
    except Exception as e:
        print(f"Failed to save graph: {e}")

    return app
