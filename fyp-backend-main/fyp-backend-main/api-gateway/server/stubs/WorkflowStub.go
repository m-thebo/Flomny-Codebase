package stubs

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func WorkflowConnection() (*grpc.ClientConn, error) {
	conn, err := grpc.NewClient("workflow-service:50002", grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	if err != nil {
		return nil, err
	}
	return conn, err
}
