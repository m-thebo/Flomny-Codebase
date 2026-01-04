package workflowcontrollers

import (
	"context"
	"net/http"
	"strconv"

	workflow_service "api-gateway/proto/generated/github.com/multiagentai/backend/workflow-service"
	"api-gateway/server"

	"github.com/gin-gonic/gin"
)

func GetPaginatedCommunityWorkflows(c *gin.Context) {
	offset := c.Query("offset")
	limit := c.Query("limit")

	if offset == "" || limit == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Offset and limit are required"})
		return
	}

	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset"})
		return
	}

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit"})
		return
	}

	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)

	// Create a gRPC request with the extracted ID
	req := &workflow_service.GetPaginatedCommunityWorkflowsRequest{
		Offset: int32(offsetInt),
		Limit:  int32(limitInt),
	}

	// Make the gRPC call to delete the integration
	res, err := serverInstance.WorkflowService.GetPaginatedCommunityWorkflows(context.Background(), req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, res)
}
