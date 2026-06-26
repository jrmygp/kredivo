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
	ErrInvalidTaskSort   = errors.New("invalid task sort")
	ErrTaskTitleRequired = errors.New("task title is required")
	ErrTaskUpdateEmpty   = errors.New("task update is empty")
)

type taskService struct {
	repository repository.TaskRepository
}

func NewTaskService(repository repository.TaskRepository) *taskService {
	return &taskService{repository}
}

func (s *taskService) FindAll(userID, status, searchQuery, sortBy, sortOrder string, page int) ([]model.Task, int64, int, int, int, error) {
	status = strings.TrimSpace(status)
	if status == "" {
		status = "all"
	}
	if status != "all" && !model.IsValidTaskStatus(status) {
		return nil, 0, 0, 0, 0, ErrInvalidTaskStatus
	}

	sortBy = strings.TrimSpace(sortBy)
	if sortBy == "" {
		sortBy = "created"
	}
	if sortBy != "title" && sortBy != "status" && sortBy != "created" {
		return nil, 0, 0, 0, 0, ErrInvalidTaskSort
	}

	sortOrder = strings.TrimSpace(sortOrder)
	if sortOrder == "" {
		sortOrder = "desc"
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, 0, 0, 0, 0, ErrInvalidTaskSort
	}

	if page < 1 {
		return []model.Task{}, 0, 0, 0, 0, nil
	}

	pageSize := 5
	offset := (page - 1) * pageSize

	tasks, totalCount, err := s.repository.FindAll(userID, status, searchQuery, sortBy, sortOrder, offset, pageSize)
	if err != nil {
		return nil, 0, 0, 0, 0, err
	}

	firstRow := offset + 1
	lastRow := offset + len(tasks)
	if len(tasks) == 0 {
		firstRow = 0
		lastRow = 0
	}
	totalPages := (int(totalCount) + pageSize - 1) / pageSize

	return tasks, totalCount, firstRow, lastRow, totalPages, nil
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

func (s *taskService) Delete(userID string, id int64) (model.Task, error) {
	return s.repository.Delete(userID, id)
}
