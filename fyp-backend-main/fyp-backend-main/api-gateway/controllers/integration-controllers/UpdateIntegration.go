package integrationcontrollers

import (
	integration_service "api-gateway/proto/generated/github.com/multiagentai/backend/integration-service"
	"api-gateway/server"
	"context"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/metadata"
)

func UpdateIntegration(c *gin.Context) {
	// Extract userID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized: userID not found in context"})
		return
	}

	// Bind the request body to the gRPC request struct
	var req integration_service.UpdateIntegrationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Retreive url params
	id := c.Param("id")
	req.Id = id
	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)

	// Create a context with metadata containing the userID
	md := metadata.New(map[string]string{"userID": userID.(string)})
	ctx := metadata.NewOutgoingContext(context.Background(), md)

	// Make the gRPC callw
	res, err := serverInstance.IntegrationService.UpdateIntegration(ctx, &req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Return the response
	c.JSON(200, gin.H{
		"integration": res.Integration,
	})
}
