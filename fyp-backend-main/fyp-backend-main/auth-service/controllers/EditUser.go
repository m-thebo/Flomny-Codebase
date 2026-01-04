package controllers

import (
	"context"
	"errors"
	"time"

	"auth-service/helpers"
	"auth-service/models"
	auth_service "auth-service/proto/generated/github.com/multiagentai/backend/auth-service"

	"golang.org/x/crypto/bcrypt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *AuthServer) EditUser(ctx context.Context, req *auth_service.EditUserRequest) (*auth_service.EditUserResponse, error) {
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

	// Initialize fields to be updated
	updateFields := bson.M{
		"updated_at": time.Now(),
	}

	// Only update fields if they are not empty
	if req.Firstname != "" {
		updateFields["first_name"] = req.Firstname
	}
	if req.Lastname != "" {
		updateFields["last_name"] = req.Lastname
	}
	if req.Email != "" {
		updateFields["email"] = req.Email
	}

	// Hash password if given
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.New("failed to hash password")
		}
		updateFields["password"] = string(hashedPassword)
	}

	// Update user in db
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": updateFields}
	result := s.DocDB.Database("fyp-db").Collection("users").FindOneAndUpdate(ctx, filter, update)
	if result.Err() == mongo.ErrNoDocuments {
		return nil, errors.New("user not found")
	} else if result.Err() != nil {
		return nil, result.Err()
	}

	var updatedUser models.User
	err = result.Decode(&updatedUser)
	if err != nil {
		return nil, errors.New("failed to decode updated user")
	}
	createdAt := timestamppb.New(updatedUser.CreatedAt)
	updatedAt := timestamppb.New(updatedUser.UpdatedAt)
	deletedAt := timestamppb.New(time.Time{}) // Set to a zero value for now

	// Return response
	return &auth_service.EditUserResponse{
		User: &auth_service.User{
			Id:           updatedUser.ID.Hex(),
			Firstname:    updatedUser.FirstName,
			Lastname:     updatedUser.LastName,
			Email:        updatedUser.Email,
			Credits:      updatedUser.Credits,
			SigninMethod: updatedUser.SignInMethod,
			CreatedAt:    createdAt,
			UpdatedAt:    updatedAt,
			DeletedAt:    deletedAt,
		},
	}, nil
}
