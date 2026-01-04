package workflowcontrollers

import (
	workflow_service "api-gateway/proto/generated/github.com/multiagentai/backend/workflow-service"
	"api-gateway/server"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/metadata"
)

func UpdateWorkflow(c *gin.Context) {
	// Extract userID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized: userID not found in context"})
		return
	}
	// Extract the ID from the route parameter
	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{"error": "Missing required field: id in route parameter"})
		return
	}

	//bind body
	var req workflow_service.UpdateWorkflowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)

	// Create a context with metadata containing the userID
	md := metadata.New(map[string]string{"userID": userID.(string)})
	ctx := metadata.NewOutgoingContext(context.Background(), md)

	// Create the gRPC request
	req.Id = id

	// Make the gRPC call
	res, err := serverInstance.WorkflowService.UpdateWorkflow(ctx, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the response
	c.JSON(http.StatusOK, res)
}
