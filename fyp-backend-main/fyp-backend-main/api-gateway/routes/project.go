package routes

import (
	projectcontrollers "api-gateway/controllers/project-controllers"
	"api-gateway/utils"

	"github.com/gin-gonic/gin"
)

// ProjectRoutes defines routes related to project operations
func ProjectRoutes(r *gin.Engine) {
	projectGroup := r.Group("/project")
	{
		// Protected routes that require authentication
		projectGroup.Use(utils.AuthMiddleware()).POST("/", projectcontrollers.CreateProject)
		projectGroup.Use(utils.AuthMiddleware()).DELETE("/:id", projectcontrollers.DeleteProject)
		projectGroup.Use(utils.AuthMiddleware()).PATCH("/:id", projectcontrollers.UpdateProject)
		projectGroup.Use(utils.AuthMiddleware()).GET("/:id", projectcontrollers.GetProjectById)
		projectGroup.Use(utils.AuthMiddleware()).GET("/user", projectcontrollers.GetUserProjects)

	}
}
