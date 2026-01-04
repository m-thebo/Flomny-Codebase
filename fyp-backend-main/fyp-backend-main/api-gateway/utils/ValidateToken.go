package utils

import (
	"errors"

	"github.com/golang-jwt/jwt"
)

func ValidateToken(tokenString string) (string, error) {
	secretKey := []byte("abcd") // Replace with a secure key or fetch from env variables

	// Parse and validate the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure the token is signed with HMAC-SHA256
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return secretKey, nil
	})

	if err != nil {
		return "", err
	}

	// Extract claims and user ID
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userID, ok := claims["sub"].(string); ok {
			return userID, nil
		}
		return "", errors.New("invalid claims in token")
	}

	return "", errors.New("invalid token")
}
