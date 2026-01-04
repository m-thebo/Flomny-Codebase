package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	FirstName    string             `bson:"first_name" json:"firstname"`
	LastName     string             `bson:"last_name" json:"lastname"`
	Email        string             `bson:"email" json:"email"`
	Password     string             `bson:"password" json:"password"`
	SignInMethod string             `bson:"signin_method" json:"signin_method"`
	Credits      int64              `bson:"credits" json:"credits"`
	CreatedAt    time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updatedAt"`
	DeletedAt    *time.Time         `bson:"deleted_at,omitempty" json:"deletedAt,omitempty"`
}
