package uploadcontrollers

import (
	"api-gateway/server"
	"api-gateway/utils"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UploadFile handles uploading a document and returns a unique URL
func UploadFile(c *gin.Context) {
	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)
	// Extract query parameters
	bucketName, _ := c.Params.Get("bucket")
	// Validate query parameters
	if bucketName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing bucket parameter"})
		return
	}
	// Retrieve file from the request
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve file"})
		return
	}
	defer file.Close()

	// Generate a unique file name
	uniqueID := uuid.New().String()
	fileName := fmt.Sprintf("%s-%s", uniqueID, header.Filename)

	// Upload the file to S3
	fileURL, err := utils.UploadToS3(file, fileName, header.Size, bucketName, serverInstance.S3Client)
	if err != nil {
		log.Println("Error uploading file to S3:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file to storage"})
		return
	}

	// Return the unique file URL
	c.JSON(http.StatusOK, gin.H{
		"message":  "File uploaded successfully",
		"file_url": fileURL,
	})
}
