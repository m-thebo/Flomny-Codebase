package integrationcontrollers

import (
	integration_service "api-gateway/proto/generated/github.com/multiagentai/backend/integration-service"
	"api-gateway/server"
	"context"

	"github.com/gin-gonic/gin"
)

func SearchIntegration(c *gin.Context) {
	// Parse query parameter
	query := c.Query("query")
	if query == "" {
		c.JSON(400, gin.H{"error": "Query parameter 'query' is required"})
		return
	}

	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)

	// Create the gRPC request
	req := &integration_service.SearchIntegrationRequest{
		Query: query,
	}

	// Make the gRPC call
	ctx := context.Background()
	res, err := serverInstance.IntegrationService.SearchIntegration(ctx, req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Return the response
	c.JSON(200, gin.H{
		"integrations": res.Integrations,
	})
}
