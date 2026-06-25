package repository

import "task-management-server/internal/model"

type TaskRepository interface {
	FindAll(userID, status string) ([]model.Task, error)
	FindByID(userID string, id int64) (model.Task, error)
	Create(task model.Task) (model.Task, error)
	Update(task model.Task) (model.Task, error)
	Delete(userID string, id int64) (model.Task, error)
}
