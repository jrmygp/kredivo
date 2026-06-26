package service

import (
	"strings"

	"task-management-server/internal/dto"
	"task-management-server/internal/model"
	"task-management-server/internal/repository"
)

type subTaskService struct {
	taskRepository    repository.TaskRepository
	subTaskRepository repository.SubTaskRepository
}

func NewSubTaskService(taskRepository repository.TaskRepository, subTaskRepository repository.SubTaskRepository) *subTaskService {
	return &subTaskService{
		taskRepository:    taskRepository,
		subTaskRepository: subTaskRepository,
	}
}

func (s *subTaskService) FindAll(userID string, taskID int64) ([]model.SubTask, error) {
	_, err := s.taskRepository.FindByID(userID, taskID)
	if err != nil {
		return nil, err
	}

	return s.subTaskRepository.FindAll(userID, taskID)
}

func (s *subTaskService) Create(userID string, taskID int64, subTaskForm dto.CreateSubTaskRequest) (model.SubTask, error) {
	_, err := s.taskRepository.FindByID(userID, taskID)
	if err != nil {
		return model.SubTask{}, err
	}

	title := strings.TrimSpace(subTaskForm.Title)
	if title == "" {
		return model.SubTask{}, ErrTaskTitleRequired
	}

	subTask := model.SubTask{
		TaskID: taskID,
		UserID: userID,
		Title:  title,
		Status: model.TaskStatusActive,
	}

	return s.subTaskRepository.Create(subTask)
}

func (s *subTaskService) Update(userID string, taskID, id int64, subTaskForm dto.UpdateSubTaskRequest) (model.SubTask, error) {
	if subTaskForm.Title == nil && subTaskForm.Status == nil {
		return model.SubTask{}, ErrTaskUpdateEmpty
	}

	_, err := s.taskRepository.FindByID(userID, taskID)
	if err != nil {
		return model.SubTask{}, err
	}

	subTask, err := s.subTaskRepository.FindByID(userID, taskID, id)
	if err != nil {
		return model.SubTask{}, err
	}

	if subTaskForm.Title != nil {
		title := strings.TrimSpace(*subTaskForm.Title)
		if title == "" {
			return model.SubTask{}, ErrTaskTitleRequired
		}
		subTask.Title = title
	}

	if subTaskForm.Status != nil {
		status := strings.TrimSpace(*subTaskForm.Status)
		if !model.IsValidTaskStatus(status) {
			return model.SubTask{}, ErrInvalidTaskStatus
		}
		subTask.Status = status
	}

	return s.subTaskRepository.Update(subTask)
}

func (s *subTaskService) Delete(userID string, taskID, id int64) (model.SubTask, error) {
	_, err := s.taskRepository.FindByID(userID, taskID)
	if err != nil {
		return model.SubTask{}, err
	}

	return s.subTaskRepository.Delete(userID, taskID, id)
}
