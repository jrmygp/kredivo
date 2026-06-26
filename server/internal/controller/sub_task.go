package controller

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"task-management-server/internal/dto"
	"task-management-server/internal/model"
	"task-management-server/internal/repository"
	"task-management-server/internal/service"
)

type SubTaskController struct {
	service service.SubTaskService
}

func NewSubTaskController(service service.SubTaskService) *SubTaskController {
	return &SubTaskController{service}
}

func convertSubTaskResponse(o model.SubTask) dto.SubTaskResponse {
	return dto.SubTaskResponse{
		ID:        o.ID,
		TaskID:    o.TaskID,
		Title:     o.Title,
		Status:    o.Status,
		CreatedAt: o.CreatedAt,
		UpdatedAt: o.UpdatedAt,
	}
}

func (h *SubTaskController) FindAll(c *gin.Context) {
	taskID, ok := idParam(c)
	if !ok {
		return
	}

	subTasks, err := h.service.FindAll(userIDFromContext(c), taskID)
	if errors.Is(err, repository.ErrTaskNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	subTaskResponses := make([]dto.SubTaskResponse, 0, len(subTasks))
	for _, subTask := range subTasks {
		subTaskResponses = append(subTaskResponses, convertSubTaskResponse(subTask))
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   subTaskResponses,
	})
}

func (h *SubTaskController) Create(c *gin.Context) {
	taskID, ok := idParam(c)
	if !ok {
		return
	}

	var subTaskForm dto.CreateSubTaskRequest
	err := c.ShouldBindJSON(&subTaskForm)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	subTask, err := h.service.Create(userIDFromContext(c), taskID, subTaskForm)
	if errors.Is(err, service.ErrTaskTitleRequired) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}
	if errors.Is(err, repository.ErrTaskNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.Response{
		Code:   http.StatusCreated,
		Status: "OK",
		Data:   convertSubTaskResponse(subTask),
	})
}

func (h *SubTaskController) Update(c *gin.Context) {
	taskID, ok := idParam(c)
	if !ok {
		return
	}
	subTaskID, ok := subTaskIDParam(c)
	if !ok {
		return
	}

	var subTaskForm dto.UpdateSubTaskRequest
	err := c.ShouldBindJSON(&subTaskForm)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	subTask, err := h.service.Update(userIDFromContext(c), taskID, subTaskID, subTaskForm)
	switch {
	case errors.Is(err, service.ErrTaskUpdateEmpty):
		c.JSON(http.StatusBadRequest, gin.H{"error": "title or status is required"})
		return
	case errors.Is(err, service.ErrTaskTitleRequired):
		c.JSON(http.StatusBadRequest, gin.H{"error": "title cannot be empty"})
		return
	case errors.Is(err, service.ErrInvalidTaskStatus):
		c.JSON(http.StatusBadRequest, gin.H{"error": "status must be active or completed"})
		return
	case errors.Is(err, repository.ErrTaskNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "task or sub-task not found"})
		return
	case err != nil:
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   convertSubTaskResponse(subTask),
	})
}

func (h *SubTaskController) Delete(c *gin.Context) {
	taskID, ok := idParam(c)
	if !ok {
		return
	}
	subTaskID, ok := subTaskIDParam(c)
	if !ok {
		return
	}

	subTask, err := h.service.Delete(userIDFromContext(c), taskID, subTaskID)
	if errors.Is(err, repository.ErrTaskNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "task or sub-task not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   convertSubTaskResponse(subTask),
	})
}
