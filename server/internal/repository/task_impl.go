package repository

import (
	"errors"
	"slices"
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

func (r *taskRepository) FindAll(userID, status string) ([]model.Task, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	tasks := make([]model.Task, 0, len(r.tasks))
	for _, task := range r.tasks {
		if task.UserID != userID {
			continue
		}
		if status != "" && status != "all" && task.Status != status {
			continue
		}

		tasks = append(tasks, task)
	}

	slices.SortFunc(tasks, func(a, b model.Task) int {
		if a.ID < b.ID {
			return -1
		}
		if a.ID > b.ID {
			return 1
		}
		return 0
	})

	return tasks, nil
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

func (r *taskRepository) Delete(userID string, id int64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	task, ok := r.tasks[id]
	if !ok || task.UserID != userID {
		return ErrTaskNotFound
	}

	delete(r.tasks, id)
	return nil
}
