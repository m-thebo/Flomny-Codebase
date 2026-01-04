package integrationcontrollers

import (
	integration_service "api-gateway/proto/generated/github.com/multiagentai/backend/integration-service"
	"api-gateway/server"
	"context"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/metadata"
)

func GetUserIntegrations(c *gin.Context) {
	// Extract userID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized: userID not found in context"})
		return
	}

	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)

	// Create a context with metadata containing the userID
	md := metadata.New(map[string]string{"userID": userID.(string)})
	ctx := metadata.NewOutgoingContext(context.Background(), md)

	// Create the gRPC request
	req := &integration_service.GetUserIntegrationsRequest{}

	// Make the gRPC call
	res, err := serverInstance.IntegrationService.GetUserIntegrations(ctx, req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if res.Integrations == nil {
		c.JSON(200, gin.H{
			"integrations": []string{},
		})
		return
	}
	// Return the response
	c.JSON(200, gin.H{
		"integrations": res.Integrations,
	})
}
