package helpers

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// CreateToken generates a signed JWT token for the given user ID.
func CreateToken(userID string) (string, error) {
	secretKey := []byte("abcd") // Replace with a secure key or fetch from env variables

	// Create token claims
	claims := jwt.MapClaims{
		"sub": userID,                                // Subject (user ID)
		"exp": time.Now().Add(time.Hour * 24).Unix(), // Token valid for 24 hours
	}

	// Create a new token with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
