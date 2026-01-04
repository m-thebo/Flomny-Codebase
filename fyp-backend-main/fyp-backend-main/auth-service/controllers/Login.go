package controllers

import (
	"context"
	"errors"

	"auth-service/helpers"
	"auth-service/models"
	auth_service "auth-service/proto/generated/github.com/multiagentai/backend/auth-service"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *AuthServer) Login(ctx context.Context, req *auth_service.LoginRequest) (*auth_service.LoginResponse, error) {
	// Find user by email
	var user models.User
	err := s.DocDB.Database("fyp-db").Collection("users").FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("user not found")
	} else if err != nil {
		return nil, err
	}

	// Check if the password is correct
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "invalid password")
	}
	// Generate JWT token
	token, err := helpers.CreateToken(user.ID.Hex())
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	//return login response
	return &auth_service.LoginResponse{
		AccessToken: token,
	}, nil
}
