package repository

import (
	"errors"
	"slices"
	"strings"
	"sync"
	"time"

	"task-management-server/internal/model"
)

var ErrTaskNotFound = errors.New("task not found")

type taskRepository struct {
	mu     sync.RWMutex
	nextID int64
	tasks  map[int64]model.Task
}

func NewTaskRepository() *taskRepository {
	return &taskRepository{
		nextID: 1,
		tasks:  make(map[int64]model.Task),
	}
}

func (r *taskRepository) FindAll(userID, status, searchQuery, sortBy, sortOrder string, offset, pageSize int) ([]model.Task, int64, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	tasks := make([]model.Task, 0, len(r.tasks))
	searchQuery = strings.ToLower(strings.TrimSpace(searchQuery))
	for _, task := range r.tasks {
		if task.UserID != userID {
			continue
		}
		if status != "" && status != "all" && task.Status != status {
			continue
		}
		if searchQuery != "" && !strings.Contains(strings.ToLower(task.Title), searchQuery) {
			continue
		}

		tasks = append(tasks, task)
	}

	slices.SortFunc(tasks, func(a, b model.Task) int {
		result := compareTasks(a, b, sortBy)
		if sortOrder == "desc" {
			return -result
		}
		return result
	})

	totalCount := int64(len(tasks))
	if offset >= len(tasks) {
		return []model.Task{}, totalCount, nil
	}

	end := offset + pageSize
	if end > len(tasks) {
		end = len(tasks)
	}

	return tasks[offset:end], totalCount, nil
}

func compareTasks(a, b model.Task, sortBy string) int {
	switch sortBy {
	case "title":
		result := strings.Compare(strings.ToLower(a.Title), strings.ToLower(b.Title))
		if result != 0 {
			return result
		}
	case "status":
		result := strings.Compare(a.Status, b.Status)
		if result != 0 {
			return result
		}
	case "created":
		if a.CreatedAt.Before(b.CreatedAt) {
			return -1
		}
		if a.CreatedAt.After(b.CreatedAt) {
			return 1
		}
	default:
	}

	if a.ID < b.ID {
		return -1
	}
	if a.ID > b.ID {
		return 1
	}
	return 0
}

func (r *taskRepository) FindByID(userID string, id int64) (model.Task, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	task, ok := r.tasks[id]
	if !ok || task.UserID != userID {
		return model.Task{}, ErrTaskNotFound
	}

	return task, nil
}

func (r *taskRepository) Create(task model.Task) (model.Task, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now().UTC()
	task.ID = r.nextID
	task.CreatedAt = now
	task.UpdatedAt = now

	r.tasks[task.ID] = task
	r.nextID++

	return task, nil
}

func (r *taskRepository) Update(task model.Task) (model.Task, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	existing, ok := r.tasks[task.ID]
	if !ok || existing.UserID != task.UserID {
		return model.Task{}, ErrTaskNotFound
	}

	task.CreatedAt = existing.CreatedAt
	task.UpdatedAt = time.Now().UTC()
	r.tasks[task.ID] = task

	return task, nil
}

func (r *taskRepository) Delete(userID string, id int64) (model.Task, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	task, ok := r.tasks[id]
	if !ok || task.UserID != userID {
		return model.Task{}, ErrTaskNotFound
	}

	delete(r.tasks, id)
	return task, nil
}
