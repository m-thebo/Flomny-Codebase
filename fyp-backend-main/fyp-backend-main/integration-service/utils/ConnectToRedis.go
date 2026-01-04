package utils

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client

// ConnectToCache initializes and returns a Redis client
func ConnectToCache() error {
	// Create a new Redis client
	client := redis.NewClient(&redis.Options{
		Addr:     "redis:6379", // Docker service name for Redis
		Password: "secretpass", // Redis password (from docker-compose.yml)
		DB:       0,            // Default DB
	})

	// Ping Redis to check connection
	ctx := context.Background()
	_, err := client.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	// 🔥 Assign the client to global RDB
	RDB = client

	fmt.Println("Successfully connected to Redis!")
	return nil
}
