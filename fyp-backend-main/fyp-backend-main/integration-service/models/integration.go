package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Integration represents the integration service model.
type Integration struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	DisplayName    string             `bson:"display_name" json:"display_name"`
	Public         bool               `bson:"public" json:"public"`
	UniqueName     string             `bson:"unique_name" json:"unique_name"`
	Description    string             `bson:"description" json:"description"`
	CreatedBy      string             `bson:"created_by" json:"created_by"` //"official" or user_id
	AdditionalInfo AdditionalInfo     `bson:"additional_info" json:"additional_info"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
	DeletedAt      *time.Time         `bson:"deleted_at,omitempty" json:"deleted_at,omitempty"`
}

type AdditionalInfo struct {
	IsFileBased  bool       `bson:"is_file_based" json:"is_file_based"`
	FileStatus   FileStatus `bson:"file_status" json:"file_status"`
	FailedReason *string    `bson:"failed_reason" json:"failed_reason"`
	//for querying the server
	PublicBaseURL string `bson:"public_base_url" json:"public_base_url"`
	//documentation URL
	DocumentationURL string `bson:"documentation_url" json:"documentation_url"`
	IsLocallyStored  bool   `bson:"is_locally_stored" json:"is_locally_stored"`
}

type FileStatus string

const (
	FileStatusNoUpload  FileStatus = "no_upload"
	FileStatusUploaded  FileStatus = "uploaded"
	FileStatusPreparing FileStatus = "preparing"
	FileStatusFailed    FileStatus = "failed"
	FileStatusReady     FileStatus = "ready"
)
