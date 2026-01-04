package integrationcontrollers

import (
	integration_service "api-gateway/proto/generated/github.com/multiagentai/backend/integration-service"
	"api-gateway/server"
	"context"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetPaginatedCommunityIntegrations(c *gin.Context) {
	offset := c.Query("offset")
	limit := c.Query("limit")

	if offset == "" || limit == "" {
		c.JSON(400, gin.H{"error": "Offset and limit are required"})
		return
	}

	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid offset"})
		return
	}

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid limit"})
		return
	}

	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)

	// Create a gRPC request with the extracted ID
	req := &integration_service.GetPaginatedCommunityIntegrationsRequest{
		Offset: int32(offsetInt),
		Limit:  int32(limitInt),
	}

	// Make the gRPC call to delete the integration
	res, err := serverInstance.IntegrationService.GetPaginatedCommunityIntegrations(context.Background(), req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, res)
}
