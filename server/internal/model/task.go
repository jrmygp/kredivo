package model

import "time"

const (
	TaskStatusActive    = "active"
	TaskStatusCompleted = "completed"
)

type Task struct {
	ID        int64
	UserID    string
	Title     string
	Status    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func IsValidTaskStatus(status string) bool {
	return status == TaskStatusActive || status == TaskStatusCompleted
}
