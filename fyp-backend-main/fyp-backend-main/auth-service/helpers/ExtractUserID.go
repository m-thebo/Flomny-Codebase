package helpers

import (
	"context"
	"errors"

	"google.golang.org/grpc/metadata"
)

// ExtractUserIDFromContext extracts the userID from the gRPC context metadata.
func ExtractUserIDFromContext(ctx context.Context) (string, error) {
	// Extract metadata from context
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "", errors.New("missing metadata in context")
	}

	// Retrieve the userID from metadata
	if values, exists := md["userid"]; exists && len(values) > 0 {
		return values[0], nil
	}
	return "", errors.New("userID not found in metadata")
}
