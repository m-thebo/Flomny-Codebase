package server

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func (s *Server) InitStorage() {
	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
		config.WithCredentialsProvider(aws.NewCredentialsCache(aws.CredentialsProviderFunc(func(ctx context.Context) (aws.Credentials, error) {
			return aws.Credentials{
				AccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
				SecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
			}, nil
		}))),
	)
	if err != nil {
		log.Fatalf("Failed to load AWS configuration: %v", err)
	}

	// Create S3 client
	s3Client := s3.NewFromConfig(cfg)

	// Check if the connection works by listing the buckets
	result, err := s3Client.ListBuckets(context.TODO(), &s3.ListBucketsInput{})
	if err != nil {
		log.Fatalf("Failed to list buckets: %v", err)
	}

	log.Println("Connected to AWS S3 successfully! Buckets found:")
	for _, bucket := range result.Buckets {
		log.Printf(" - %s created on %s\n", *bucket.Name, bucket.CreationDate)
	}

	// Assign the S3 client to the global variable
	s.S3Client = s3Client
}
