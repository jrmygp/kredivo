package controller

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"task-management-server/internal/dto"
	"task-management-server/internal/model"
	"task-management-server/internal/repository"
	"task-management-server/internal/service"
)

type TaskController struct {
	service service.TaskService
}

func NewTaskController(service service.TaskService) *TaskController {
	return &TaskController{service}
}

func convertTaskResponse(o model.Task) dto.TaskResponse {
	return dto.TaskResponse{
		ID:        o.ID,
		Title:     o.Title,
		Status:    o.Status,
		CreatedAt: o.CreatedAt,
		UpdatedAt: o.UpdatedAt,
	}
}

func (h *TaskController) FindAll(c *gin.Context) {
	searchQuery := c.Query("search")
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to convert page to int",
		})
		return
	}

	tasks, totalCount, firstRow, lastRow, totalPages, err := h.service.FindAll(
		userIDFromContext(c),
		c.DefaultQuery("status", "all"),
		searchQuery,
		page,
	)
	if errors.Is(err, service.ErrInvalidTaskStatus) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "status must be all, active, or completed",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	taskResponses := make([]dto.TaskResponse, 0, len(tasks))
	for _, task := range tasks {
		taskResponses = append(taskResponses, convertTaskResponse(task))
	}

	webResponse := dto.PaginationResponse{
		Code:       http.StatusOK,
		Status:     "OK",
		Data:       taskResponses,
		TotalCount: totalCount,
		FirstRow:   firstRow,
		LastRow:    lastRow,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, webResponse)
}

func (h *TaskController) Create(c *gin.Context) {
	var taskForm dto.CreateTaskRequest

	err := c.ShouldBindJSON(&taskForm)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	task, err := h.service.Create(userIDFromContext(c), taskForm)
	if errors.Is(err, service.ErrTaskTitleRequired) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "title is required",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": err.Error(),
		})
		return
	}

	webResponse := dto.Response{
		Code:   http.StatusCreated,
		Status: "OK",
		Data:   convertTaskResponse(task),
	}

	c.JSON(http.StatusCreated, webResponse)
}

func (h *TaskController) Update(c *gin.Context) {
	ID, ok := idParam(c)
	if !ok {
		return
	}

	var taskForm dto.UpdateTaskRequest

	err := c.ShouldBindJSON(&taskForm)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	task, err := h.service.Update(userIDFromContext(c), ID, taskForm)
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
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	case err != nil:
		c.JSON(http.StatusInternalServerError, gin.H{"errors": err.Error()})
		return
	}

	webResponse := dto.Response{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   convertTaskResponse(task),
	}

	c.JSON(http.StatusOK, webResponse)
}

func (h *TaskController) Delete(c *gin.Context) {
	ID, ok := idParam(c)
	if !ok {
		return
	}

	task, err := h.service.Delete(userIDFromContext(c), ID)
	if errors.Is(err, repository.ErrTaskNotFound) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "task not found",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": err.Error(),
		})
		return
	}

	webResponse := dto.Response{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   convertTaskResponse(task),
	}

	c.JSON(http.StatusOK, webResponse)
}

func userIDFromContext(c *gin.Context) string {
	userID, _ := c.Get("userID")
	return userID.(string)
}

func idParam(c *gin.Context) (int64, bool) {
	idParam := c.Param("id")
	ID, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil || ID < 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid ID format",
		})
		return 0, false
	}

	return ID, true
}
