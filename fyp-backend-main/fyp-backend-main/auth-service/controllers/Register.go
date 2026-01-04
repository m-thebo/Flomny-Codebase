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
	"google.golang.org/protobuf/types/known/timestamppb"
)

func (s *AuthServer) Register(ctx context.Context, req *auth_service.RegisterRequest) (*auth_service.RegisterResponse, error) {
	// Check if user already exists
	var existingUser models.User
	err := s.DocDB.Database("fyp-db").Collection("users").FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	// Create new user
	newUser := models.User{
		ID:           primitive.NewObjectID(),
		FirstName:    req.Firstname,
		LastName:     req.Lastname,
		Email:        req.Email,
		Password:     string(hashedPassword),
		SignInMethod: "local",
		Credits:      0,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = s.DocDB.Database("fyp-db").Collection("users").InsertOne(ctx, newUser)
	if err != nil {
		return nil, errors.New("failed to create user")
	}

	// Generate token using helper
	token, err := helpers.CreateToken(newUser.ID.Hex())
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	createdAt := timestamppb.New(newUser.CreatedAt)
	updatedAt := timestamppb.New(newUser.UpdatedAt)
	deletedAt := timestamppb.New(time.Time{}) // Set to a zero value for now
	//Return response
	return &auth_service.RegisterResponse{
		Token: token,
		User: &auth_service.User{
			Id:           newUser.ID.Hex(),
			Firstname:    newUser.FirstName,
			Lastname:     newUser.LastName,
			Email:        newUser.Email,
			Credits:      newUser.Credits,
			SigninMethod: newUser.SignInMethod,
			CreatedAt:    createdAt,
			UpdatedAt:    updatedAt,
			DeletedAt:    deletedAt,
		},
	}, nil
}
