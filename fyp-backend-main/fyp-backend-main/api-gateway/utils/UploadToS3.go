package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// UploadToS3 uploads the file to AWS S3 and returns the file URL
func UploadToS3(file multipart.File, fileName string, fileSize int64, bucketName string, client *s3.Client) (string, error) {
	// Ensure the S3 client is initialized
	if client == nil {
		return "", fmt.Errorf("S3 client not initialized")
	}

	// Check if the bucket exists
	_, err := client.HeadBucket(context.TODO(), &s3.HeadBucketInput{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		return "", fmt.Errorf("error checking bucket: %v", err)
	}

	// Upload the file
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(fileName),
		Body:        file,
		ContentType: aws.String("application/octet-stream"), // Adjust content type if needed
	})
	if err != nil {
		return "", fmt.Errorf("error uploading file: %v", err)
	}

	// Construct the file URL
	fileURL := fmt.Sprintf("%s/docs/%s/%s", os.Getenv("GATEWAY_ADDRESS"), bucketName, fileName)
	return fileURL, nil
}
