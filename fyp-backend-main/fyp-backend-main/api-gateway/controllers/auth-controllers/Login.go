package authcontrollers

import (
	auth_service "api-gateway/proto/generated/github.com/multiagentai/backend/auth-service"
	"api-gateway/server"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	//bind request
	var req auth_service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	//validate request
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)
	res, err := serverInstance.AuthService.Login(c, &req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// You can now use serverInstance here
	c.JSON(200, gin.H{
		"response": res,
	})
}
