package repository

import (
	"slices"
	"sync"
	"time"

	"task-management-server/internal/model"
)

type subTaskRepository struct {
	mu       sync.RWMutex
	nextID   int64
	subTasks map[int64]model.SubTask
}

func NewSubTaskRepository() *subTaskRepository {
	return &subTaskRepository{
		nextID:   1,
		subTasks: make(map[int64]model.SubTask),
	}
}

func (r *subTaskRepository) FindAll(userID string, taskID int64) ([]model.SubTask, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	subTasks := make([]model.SubTask, 0, len(r.subTasks))
	for _, subTask := range r.subTasks {
		if subTask.UserID == userID && subTask.TaskID == taskID {
			subTasks = append(subTasks, subTask)
		}
	}

	slices.SortFunc(subTasks, func(a, b model.SubTask) int {
		if a.ID < b.ID {
			return -1
		}
		if a.ID > b.ID {
			return 1
		}
		return 0
	})

	return subTasks, nil
}

func (r *subTaskRepository) FindByID(userID string, taskID, id int64) (model.SubTask, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	subTask, ok := r.subTasks[id]
	if !ok || subTask.UserID != userID || subTask.TaskID != taskID {
		return model.SubTask{}, ErrTaskNotFound
	}

	return subTask, nil
}

func (r *subTaskRepository) Create(subTask model.SubTask) (model.SubTask, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now().UTC()
	subTask.ID = r.nextID
	subTask.CreatedAt = now
	subTask.UpdatedAt = now

	r.subTasks[subTask.ID] = subTask
	r.nextID++

	return subTask, nil
}

func (r *subTaskRepository) Update(subTask model.SubTask) (model.SubTask, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	existing, ok := r.subTasks[subTask.ID]
	if !ok || existing.UserID != subTask.UserID || existing.TaskID != subTask.TaskID {
		return model.SubTask{}, ErrTaskNotFound
	}

	subTask.CreatedAt = existing.CreatedAt
	subTask.UpdatedAt = time.Now().UTC()
	r.subTasks[subTask.ID] = subTask

	return subTask, nil
}

func (r *subTaskRepository) Delete(userID string, taskID, id int64) (model.SubTask, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	subTask, ok := r.subTasks[id]
	if !ok || subTask.UserID != userID || subTask.TaskID != taskID {
		return model.SubTask{}, ErrTaskNotFound
	}

	delete(r.subTasks, id)
	return subTask, nil
}

func (r *subTaskRepository) DeleteByTaskID(userID string, taskID int64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for id, subTask := range r.subTasks {
		if subTask.UserID == userID && subTask.TaskID == taskID {
			delete(r.subTasks, id)
		}
	}

	return nil
}

func (r *subTaskRepository) CountByTaskIDs(userID string, taskIDs []int64) map[int64]int {
	r.mu.RLock()
	defer r.mu.RUnlock()

	taskIDSet := make(map[int64]struct{}, len(taskIDs))
	counts := make(map[int64]int, len(taskIDs))
	for _, taskID := range taskIDs {
		taskIDSet[taskID] = struct{}{}
		counts[taskID] = 0
	}

	for _, subTask := range r.subTasks {
		if subTask.UserID != userID {
			continue
		}
		if _, ok := taskIDSet[subTask.TaskID]; ok {
			counts[subTask.TaskID]++
		}
	}

	return counts
}
