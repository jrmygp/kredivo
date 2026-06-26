package service

import (
	"errors"
	"slices"
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
	repository        repository.TaskRepository
	subTaskRepository repository.SubTaskRepository
}

func NewTaskService(repository repository.TaskRepository, subTaskRepository repository.SubTaskRepository) *taskService {
	return &taskService{repository: repository, subTaskRepository: subTaskRepository}
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
	if sortBy != "title" && sortBy != "status" && sortBy != "created" && sortBy != "subTasksCount" {
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

	if sortBy == "subTasksCount" {
		tasks, err := s.repository.FindAllFiltered(userID, status, searchQuery)
		if err != nil {
			return nil, 0, 0, 0, 0, err
		}

		taskIDs := make([]int64, 0, len(tasks))
		for _, task := range tasks {
			taskIDs = append(taskIDs, task.ID)
		}
		subTaskCounts := s.CountSubTasksByTaskIDs(userID, taskIDs)

		slices.SortFunc(tasks, func(a, b model.Task) int {
			result := subTaskCounts[a.ID] - subTaskCounts[b.ID]
			if result == 0 {
				if a.ID < b.ID {
					result = -1
				} else if a.ID > b.ID {
					result = 1
				}
			}
			if sortOrder == "desc" {
				return -result
			}
			return result
		})

		paginatedTasks, totalCount, firstRow, lastRow, totalPages := paginateTasks(tasks, offset, pageSize)
		return paginatedTasks, totalCount, firstRow, lastRow, totalPages, nil
	}

	tasks, totalCount, err := s.repository.FindAll(userID, status, searchQuery, sortBy, sortOrder, offset, pageSize)
	if err != nil {
		return nil, 0, 0, 0, 0, err
	}

	firstRow, lastRow, totalPages := paginationMetadata(len(tasks), totalCount, offset, pageSize)
	return tasks, totalCount, firstRow, lastRow, totalPages, nil
}

func paginateTasks(tasks []model.Task, offset, pageSize int) ([]model.Task, int64, int, int, int) {
	totalCount := int64(len(tasks))
	if offset >= len(tasks) {
		return []model.Task{}, totalCount, 0, 0, paginationTotalPages(totalCount, pageSize)
	}

	end := offset + pageSize
	if end > len(tasks) {
		end = len(tasks)
	}

	paginatedTasks := tasks[offset:end]
	firstRow, lastRow, totalPages := paginationMetadata(len(paginatedTasks), totalCount, offset, pageSize)
	return paginatedTasks, totalCount, firstRow, lastRow, totalPages
}

func paginationMetadata(rowCount int, totalCount int64, offset, pageSize int) (int, int, int) {
	firstRow := offset + 1
	lastRow := offset + rowCount
	if rowCount == 0 {
		firstRow = 0
		lastRow = 0
	}
	totalPages := paginationTotalPages(totalCount, pageSize)

	return firstRow, lastRow, totalPages
}

func paginationTotalPages(totalCount int64, pageSize int) int {
	return (int(totalCount) + pageSize - 1) / pageSize
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
	task, err := s.repository.Delete(userID, id)
	if err != nil {
		return model.Task{}, err
	}

	if s.subTaskRepository != nil {
		err = s.subTaskRepository.DeleteByTaskID(userID, id)
		if err != nil {
			return model.Task{}, err
		}
	}

	return task, nil
}

func (s *taskService) CountSubTasksByTaskIDs(userID string, taskIDs []int64) map[int64]int {
	if s.subTaskRepository == nil {
		return map[int64]int{}
	}

	return s.subTaskRepository.CountByTaskIDs(userID, taskIDs)
}
