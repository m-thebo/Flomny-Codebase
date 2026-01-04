package routes

import (
	authcontrollers "api-gateway/controllers/auth-controllers"
	"api-gateway/utils"

	"github.com/gin-gonic/gin"
)

// AuthRoutes defines routes related to auth operations
func AuthRoutes(r *gin.Engine) {
	authGroup := r.Group("/auth")
	{
		authGroup.POST("/login", authcontrollers.Login)
		authGroup.POST("/register", authcontrollers.Register)
		// Add more user routes as needed
		// Protected routes that require authentication
		authGroup.Use(utils.AuthMiddleware()).GET("/", authcontrollers.GetUser)
		authGroup.Use(utils.AuthMiddleware()).PATCH("/", authcontrollers.EditUser)
		authGroup.Use(utils.AuthMiddleware()).DELETE("/", authcontrollers.DeleteUser)
	}
}
