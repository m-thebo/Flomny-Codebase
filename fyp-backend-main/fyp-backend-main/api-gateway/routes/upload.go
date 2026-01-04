package routes

import (
	uploadcontrollers "api-gateway/controllers/upload-controllers"
	"api-gateway/utils"

	"github.com/gin-gonic/gin"
)

// UploadRoutes defines routes related to auth operations
func UploadRoutes(r *gin.Engine) {
	uploadGroup := r.Group("/docs")
	{
		// Protected routes that require authentication
		uploadGroup.Use(utils.AuthMiddleware()).POST("/:bucket", uploadcontrollers.UploadFile)
		uploadGroup.Use(utils.AuthMiddleware()).GET("/:bucket/:file", uploadcontrollers.GetFile)
	}
}
