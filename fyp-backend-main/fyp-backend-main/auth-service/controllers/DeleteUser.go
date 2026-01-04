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

func (s *AuthServer) DeleteUser(ctx context.Context, req *auth_service.DeleteUserRequest) (*auth_service.DeleteUserResponse, error) {
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

	// delete user by updating DeletedAt
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{"deleted_at": time.Now()}}
	result := s.DocDB.Database("fyp-db").Collection("users").FindOneAndUpdate(ctx, filter, update)
	if result.Err() == mongo.ErrNoDocuments {
		return nil, errors.New("user not found")
	} else if result.Err() != nil {
		return nil, result.Err()
	}

	var deletedUser models.User
	err = result.Decode(&deletedUser)
	if err != nil {
		return nil, errors.New("failed to decode deleted user")
	}
	createdAt := timestamppb.New(deletedUser.CreatedAt)
	updatedAt := timestamppb.New(deletedUser.UpdatedAt)
	deletedAt := timestamppb.New(time.Now()) // Set to a zero value for now

	//return response
	return &auth_service.DeleteUserResponse{
		User: &auth_service.User{
			Id:        deletedUser.ID.Hex(),
			Firstname: deletedUser.FirstName,
			Lastname:  deletedUser.LastName,
			Email:     deletedUser.Email,
			Credits:   deletedUser.Credits,
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
			DeletedAt: deletedAt,
		},
	}, nil
}
