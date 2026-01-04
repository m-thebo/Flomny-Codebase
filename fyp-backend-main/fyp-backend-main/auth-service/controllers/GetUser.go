package controllers

import (
	"context"
	"errors"
	"time"

	"auth-service/helpers"
	"auth-service/models"
	auth_service "auth-service/proto/generated/github.com/multiagentai/backend/auth-service"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *AuthServer) GetUser(ctx context.Context, req *auth_service.GetUserRequest) (*auth_service.GetUserResponse, error) {
	// Extract userID using the helper function
	userID, err := helpers.ExtractUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	// Convert userID string to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID format")
	}

	// Find user by ID
	var user models.User
	err = s.DocDB.Database("fyp-db").Collection("users").FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("user not found")
	} else if err != nil {
		return nil, err
	}
	if user.DeletedAt != nil {
		return nil, errors.New("user not found")
	}
	// Convert timestamps
	createdAt := timestamppb.New(user.CreatedAt)
	updatedAt := timestamppb.New(user.UpdatedAt)
	deletedAt := timestamppb.New(time.Time{}) // Set to a zero value for now

	// Return user details
	return &auth_service.GetUserResponse{
		User: &auth_service.User{
			Id:        user.ID.Hex(),
			Firstname: user.FirstName,
			Lastname:  user.LastName,
			Email:     user.Email,
			Credits:   user.Credits,
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
			DeletedAt: deletedAt,
		},
	}, nil
}
