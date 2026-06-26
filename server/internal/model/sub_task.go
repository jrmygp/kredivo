package model

import "time"

type SubTask struct {
	ID        int64
	TaskID    int64
	UserID    string
	Title     string
	Status    string
	CreatedAt time.Time
	UpdatedAt time.Time
}
