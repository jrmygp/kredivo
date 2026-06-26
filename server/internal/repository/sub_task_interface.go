package repository

import "task-management-server/internal/model"

type SubTaskRepository interface {
	FindAll(userID string, taskID int64) ([]model.SubTask, error)
	FindByID(userID string, taskID, id int64) (model.SubTask, error)
	Create(subTask model.SubTask) (model.SubTask, error)
	Update(subTask model.SubTask) (model.SubTask, error)
	Delete(userID string, taskID, id int64) (model.SubTask, error)
	DeleteByTaskID(userID string, taskID int64) error
	CountByTaskIDs(userID string, taskIDs []int64) map[int64]int
}
