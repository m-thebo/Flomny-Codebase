package main

import (
	"api-gateway/routes"
	"api-gateway/server"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var serverInstance *server.Server

func main() {
	// Init Stubs
	serverInstance = &server.Server{}
	serverInstance.InitServer()

	// Start Server
	r := gin.Default()

	// CORS Middleware Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Middleware to attach server instance to context
	r.Use(func(c *gin.Context) {
		c.Set("server", serverInstance)
		c.Next()
	})

	// Hello World
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello World",
		})
	})

	// Register Routes
	routes.AuthRoutes(r)
	routes.UploadRoutes(r)
	routes.IntegrationRoutes(r)
	routes.ProjectRoutes(r)
	routes.WorkflowRoutes(r)
	// Start the server
	r.Run(":8000")
}
