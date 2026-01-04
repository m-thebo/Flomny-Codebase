package routes

import (
	workflowcontrollers "api-gateway/controllers/workflow-controllers"
	"api-gateway/utils"

	"github.com/gin-gonic/gin"
)

// WorkflowRoutes defines routes related to workflow operations
func WorkflowRoutes(r *gin.Engine) {
	workflowGroup := r.Group("/workflow")
	{
		// Protected routes that require authentication
		workflowGroup.Use(utils.AuthMiddleware()).POST("/", workflowcontrollers.CreateWorkflow)
		workflowGroup.Use(utils.AuthMiddleware()).GET("/:id", workflowcontrollers.GetWorkflowById)
		workflowGroup.Use(utils.AuthMiddleware()).DELETE("/:id", workflowcontrollers.DeleteWorkflow)
		workflowGroup.Use(utils.AuthMiddleware()).PATCH("/:id", workflowcontrollers.UpdateWorkflow)
		workflowGroup.Use(utils.AuthMiddleware()).GET("/user", workflowcontrollers.GetUserWorkflows)
		workflowGroup.Use(utils.AuthMiddleware()).GET("/community", workflowcontrollers.GetPaginatedCommunityWorkflows)
	}
}
