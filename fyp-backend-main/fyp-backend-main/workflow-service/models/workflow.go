package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Workflow struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	CreatedBy   string             `bson:"createdBy,omitempty"`
	ProjectID   *string            `bson:"projectId,omitempty"`
	Name        string             `bson:"name,omitempty"`
	Description string             `bson:"description,omitempty"`
	WorkflowURL string             `bson:"workflowURL,omitempty"`
	Public      bool               `bson:"public,omitempty"`
	CreatedAt   time.Time          `bson:"createdAt,omitempty"`
	UpdatedAt   time.Time          `bson:"updatedAt,omitempty"`
	DeletedAt   *time.Time         `bson:"deletedAt,omitempty"`
}
