package service

import (
	"task-management-server/internal/dto"
	"task-management-server/internal/model"
)

type TaskService interface {
	FindAll(userID, status string) ([]model.Task, error)
	Create(userID string, task dto.CreateTaskRequest) (model.Task, error)
	Update(userID string, id int64, task dto.UpdateTaskRequest) (model.Task, error)
	Delete(userID string, id int64) (model.Task, error)
}
