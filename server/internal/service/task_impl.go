package service

import (
	"errors"
	"strings"

	"task-management-server/internal/dto"
	"task-management-server/internal/model"
	"task-management-server/internal/repository"
)

var (
	ErrInvalidTaskStatus = errors.New("invalid task status")
	ErrTaskTitleRequired = errors.New("task title is required")
	ErrTaskUpdateEmpty   = errors.New("task update is empty")
)

type taskService struct {
	repository repository.TaskRepository
}

func NewTaskService(repository repository.TaskRepository) *taskService {
	return &taskService{repository}
}

func (s *taskService) FindAll(userID, status string) ([]model.Task, error) {
	status = strings.TrimSpace(status)
	if status == "" {
		status = "all"
	}
	if status != "all" && !model.IsValidTaskStatus(status) {
		return nil, ErrInvalidTaskStatus
	}

	return s.repository.FindAll(userID, status)
}

func (s *taskService) Create(userID string, taskForm dto.CreateTaskRequest) (model.Task, error) {
	title := strings.TrimSpace(taskForm.Title)
	if title == "" {
		return model.Task{}, ErrTaskTitleRequired
	}

	task := model.Task{
		UserID: userID,
		Title:  title,
		Status: model.TaskStatusActive,
	}

	return s.repository.Create(task)
}

func (s *taskService) Update(userID string, id int64, taskForm dto.UpdateTaskRequest) (model.Task, error) {
	if taskForm.Title == nil && taskForm.Status == nil {
		return model.Task{}, ErrTaskUpdateEmpty
	}

	task, err := s.repository.FindByID(userID, id)
	if err != nil {
		return model.Task{}, err
	}

	if taskForm.Title != nil {
		title := strings.TrimSpace(*taskForm.Title)
		if title == "" {
			return model.Task{}, ErrTaskTitleRequired
		}
		task.Title = title
	}

	if taskForm.Status != nil {
		status := strings.TrimSpace(*taskForm.Status)
		if !model.IsValidTaskStatus(status) {
			return model.Task{}, ErrInvalidTaskStatus
		}
		task.Status = status
	}

	return s.repository.Update(task)
}

func (s *taskService) Delete(userID string, id int64) error {
	return s.repository.Delete(userID, id)
}
