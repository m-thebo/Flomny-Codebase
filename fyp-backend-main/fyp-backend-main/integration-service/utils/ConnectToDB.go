package utils

import (
	"context"
	"log"

	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ConnectToDB initializes the MongoDB client and connects to the zksc database
func ConnectToDB() (*mongo.Client, error) {
	//env variable
	uri := os.Getenv("MONGO_URL")
	if uri == "" {
		log.Fatal("MONGO_URI environment variable is not set")
	}
	clientOptions := options.Client().ApplyURI(uri)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
		return nil, err
	}

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
		return nil, err
	}

	log.Println("Connected to MongoDB!")
	return client, nil
}
