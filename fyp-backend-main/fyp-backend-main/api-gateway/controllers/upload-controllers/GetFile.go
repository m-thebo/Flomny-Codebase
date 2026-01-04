package uploadcontrollers

import (
	"api-gateway/server"
	"context"
	"fmt"
	"io"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
)

func GetFile(c *gin.Context) {
	// Retrieve the server instance from context
	s, _ := c.Get("server")
	serverInstance := s.(*server.Server)
	// Extract query parameters
	bucketName, _ := c.Params.Get("bucket")
	fileName, _ := c.Params.Get("file")

	// Validate query parameters
	if bucketName == "" || fileName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing bucket or file parameter"})
		return
	}

	// Retrieve the file from S3
	result, err := serverInstance.S3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(fileName),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch file '%s' from bucket '%s'", fileName, bucketName)})
		return
	}
	defer result.Body.Close()

	// Get content type from metadata
	contentType := "application/octet-stream" // Default to binary stream
	if result.ContentType != nil {
		contentType = *result.ContentType
	}

	// Set headers for inline display
	c.Writer.Header().Set("Content-Type", contentType)
	c.Writer.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%s", fileName))
	if result.ContentLength != nil {
		c.Writer.Header().Set("Content-Length", fmt.Sprintf("%d", *result.ContentLength))
	}

	// Stream the file content to the client
	_, err = io.Copy(c.Writer, result.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stream file"})
		return
	}
}
