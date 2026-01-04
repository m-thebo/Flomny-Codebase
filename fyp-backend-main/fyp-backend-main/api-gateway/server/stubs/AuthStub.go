package stubs

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func AuthConnection() (*grpc.ClientConn, error) {
	conn, err := grpc.NewClient("auth-service:50000", grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	if err != nil {
		return nil, err
	}
	return conn, err
}
