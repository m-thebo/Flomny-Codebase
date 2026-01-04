package routes

import (
	"api-gateway/utils"

	integrationcontrollers "api-gateway/controllers/integration-controllers"

	"github.com/gin-gonic/gin"
)

// IntegrationRoutes defines routes related to integrations operations
func IntegrationRoutes(r *gin.Engine) {
	integrationGroup := r.Group("/integration")
	{
		// Protected routes that require authentication
		integrationGroup.Use(utils.AuthMiddleware()).POST("/", integrationcontrollers.CreateIntegration)
		integrationGroup.Use(utils.AuthMiddleware()).DELETE("/:id", integrationcontrollers.DeleteIntegration)
		integrationGroup.Use(utils.AuthMiddleware()).PATCH("/:id", integrationcontrollers.UpdateIntegration)
		integrationGroup.Use(utils.AuthMiddleware()).GET("/user", integrationcontrollers.GetUserIntegrations)
		integrationGroup.Use(utils.AuthMiddleware()).GET("/search", integrationcontrollers.SearchIntegration)
		integrationGroup.Use(utils.AuthMiddleware()).GET("/community", integrationcontrollers.GetPaginatedCommunityIntegrations)
	}
}
