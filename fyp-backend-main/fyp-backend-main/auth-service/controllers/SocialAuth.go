package controllers

import (
	auth_service "auth-service/proto/generated/github.com/multiagentai/backend/auth-service"
	"context"
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"
)

// TODO: Implement SocialAuth function correctly with google auth
func (s *AuthServer) SocialAuth(ctx context.Context, req *auth_service.SocialAuthRequest) (*auth_service.SocialAuthResponse, error) {
	//  return a dummy response with dummy token and data

	user := &auth_service.User{
		Id:           "dummyUserId",
		Firstname:    "John",
		Lastname:     "Doe",
		Email:        "john.doe@example.com",
		Password:     "dummyPassword123",
		SigninMethod: "email",
		Credits:      100,
	}

	createdAt := timestamppb.New(time.Now())
	updatedAt := timestamppb.New(time.Now())
	deletedAt := timestamppb.New(time.Time{}) // Set to a zero value for now
	user.CreatedAt = createdAt
	user.UpdatedAt = updatedAt
	user.DeletedAt = deletedAt

	// Returning a dummy token and user data
	return &auth_service.SocialAuthResponse{
		Token: "dummy-social-token",
		User:  user,
	}, nil
}
