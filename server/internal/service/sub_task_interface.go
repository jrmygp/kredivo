package service

import (
	"task-management-server/internal/dto"
	"task-management-server/internal/model"
)

type SubTaskService interface {
	FindAll(userID string, taskID int64) ([]model.SubTask, error)
	Create(userID string, taskID int64, subTask dto.CreateSubTaskRequest) (model.SubTask, error)
	Update(userID string, taskID, id int64, subTask dto.UpdateSubTaskRequest) (model.SubTask, error)
	Delete(userID string, taskID, id int64) (model.SubTask, error)
}
