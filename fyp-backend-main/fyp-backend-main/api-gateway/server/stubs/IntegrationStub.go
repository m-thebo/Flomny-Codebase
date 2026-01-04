package stubs

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func IntegrationConnection() (*grpc.ClientConn, error) {
	conn, err := grpc.NewClient("integration-service:50051", grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	if err != nil {
		return nil, err
	}
	return conn, err
}
