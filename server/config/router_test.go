package config

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"task-management-server/internal/controller"
	"task-management-server/internal/repository"
	"task-management-server/internal/service"
)

func TestTaskFlow(t *testing.T) {
	router := testRouter()

	loginResp := doJSON(router, http.MethodPost, "/api/login", `{"username":"demo","password":"demo"}`, false)
	if loginResp.Code != http.StatusOK {
		t.Fatalf("login status = %d, want %d", loginResp.Code, http.StatusOK)
	}

	createResp := doJSON(router, http.MethodPost, "/api/tasks", `{"title":"Write assessment"}`, true)
	if createResp.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want %d; body = %s", createResp.Code, http.StatusCreated, createResp.Body.String())
	}

	var created struct {
		Data struct {
			ID     int64  `json:"id"`
			Status string `json:"status"`
		} `json:"data"`
	}
	if err := json.Unmarshal(createResp.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode create response: %v", err)
	}
	if created.Data.ID != 1 || created.Data.Status != "active" {
		t.Fatalf("unexpected created task: %+v", created.Data)
	}

	updateResp := doJSON(router, http.MethodPut, "/api/tasks/1", `{"status":"completed"}`, true)
	if updateResp.Code != http.StatusOK {
		t.Fatalf("update status = %d, want %d; body = %s", updateResp.Code, http.StatusOK, updateResp.Body.String())
	}

	listResp := doJSON(router, http.MethodGet, "/api/tasks?status=completed", "", true)
	if listResp.Code != http.StatusOK {
		t.Fatalf("list status = %d, want %d; body = %s", listResp.Code, http.StatusOK, listResp.Body.String())
	}

	var listed struct {
		TotalCount int64 `json:"totalCount"`
		FirstRow   int   `json:"firstRow"`
		LastRow    int   `json:"lastRow"`
		TotalPages int   `json:"totalPages"`
		Data       []struct {
			ID     int64  `json:"id"`
			Status string `json:"status"`
		} `json:"data"`
	}
	if err := json.Unmarshal(listResp.Body.Bytes(), &listed); err != nil {
		t.Fatalf("decode list response: %v", err)
	}
	if len(listed.Data) != 1 || listed.Data[0].ID != 1 || listed.Data[0].Status != "completed" {
		t.Fatalf("unexpected completed tasks: %+v", listed.Data)
	}
	if listed.TotalCount != 1 || listed.FirstRow != 1 || listed.LastRow != 1 || listed.TotalPages != 1 {
		t.Fatalf("unexpected pagination metadata: %+v", listed)
	}

	deleteResp := doJSON(router, http.MethodDelete, "/api/tasks/1", "", true)
	if deleteResp.Code != http.StatusOK {
		t.Fatalf("delete status = %d, want %d", deleteResp.Code, http.StatusOK)
	}

	var deleted struct {
		Data struct {
			ID     int64  `json:"id"`
			Status string `json:"status"`
		} `json:"data"`
	}
	if err := json.Unmarshal(deleteResp.Body.Bytes(), &deleted); err != nil {
		t.Fatalf("decode delete response: %v", err)
	}
	if deleted.Data.ID != 1 || deleted.Data.Status != "completed" {
		t.Fatalf("unexpected deleted task: %+v", deleted.Data)
	}
}

func TestTaskRoutesRequireAuth(t *testing.T) {
	router := testRouter()

	req := httptest.NewRequest(http.MethodGet, "/api/tasks", nil)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", resp.Code, http.StatusUnauthorized)
	}
}

func TestStatsFlow(t *testing.T) {
	router := testRouter()

	doJSON(router, http.MethodPost, "/api/tasks", `{"title":"Active one"}`, true)
	doJSON(router, http.MethodPost, "/api/tasks", `{"title":"Active two"}`, true)
	doJSON(router, http.MethodPost, "/api/tasks", `{"title":"Completed one"}`, true)
	doJSON(router, http.MethodPut, "/api/tasks/3", `{"status":"completed"}`, true)

	statsResp := doJSON(router, http.MethodGet, "/api/stats", "", true)
	if statsResp.Code != http.StatusOK {
		t.Fatalf("stats status = %d, want %d; body = %s", statsResp.Code, http.StatusOK, statsResp.Body.String())
	}

	var stats struct {
		Data struct {
			UserID         string  `json:"userId"`
			TotalTasks     int     `json:"totalTasks"`
			ActiveTasks    int     `json:"activeTasks"`
			CompletedTasks int     `json:"completedTasks"`
			CompletionRate float64 `json:"completionRate"`
		} `json:"data"`
	}
	if err := json.Unmarshal(statsResp.Body.Bytes(), &stats); err != nil {
		t.Fatalf("decode stats response: %v", err)
	}
	if stats.Data.UserID != service.DemoUserID {
		t.Fatalf("unexpected stats user ID: %s", stats.Data.UserID)
	}
	if stats.Data.TotalTasks != 3 || stats.Data.ActiveTasks != 2 || stats.Data.CompletedTasks != 1 {
		t.Fatalf("unexpected stats counts: %+v", stats.Data)
	}
	if stats.Data.CompletionRate != 33.33 {
		t.Fatalf("unexpected completion rate: got %v, want 33.33", stats.Data.CompletionRate)
	}
}

func TestTaskFindAllSorting(t *testing.T) {
	router := testRouter()

	doJSON(router, http.MethodPost, "/api/tasks", `{"title":"Alpha"}`, true)
	doJSON(router, http.MethodPost, "/api/tasks", `{"title":"Charlie"}`, true)
	doJSON(router, http.MethodPost, "/api/tasks", `{"title":"Bravo"}`, true)

	listResp := doJSON(router, http.MethodGet, "/api/tasks?sortBy=title&sortOrder=desc", "", true)
	if listResp.Code != http.StatusOK {
		t.Fatalf("list status = %d, want %d; body = %s", listResp.Code, http.StatusOK, listResp.Body.String())
	}

	var listed struct {
		Data []struct {
			Title string `json:"title"`
		} `json:"data"`
	}
	if err := json.Unmarshal(listResp.Body.Bytes(), &listed); err != nil {
		t.Fatalf("decode list response: %v", err)
	}

	got := []string{listed.Data[0].Title, listed.Data[1].Title, listed.Data[2].Title}
	want := []string{"Charlie", "Bravo", "Alpha"}
	for index := range want {
		if got[index] != want[index] {
			t.Fatalf("unexpected sort order: got %+v, want %+v", got, want)
		}
	}
}

func TestSubTaskFlow(t *testing.T) {
	router := testRouter()

	createTaskResp := doJSON(router, http.MethodPost, "/api/tasks", `{"title":"Parent task"}`, true)
	if createTaskResp.Code != http.StatusCreated {
		t.Fatalf("create task status = %d, want %d; body = %s", createTaskResp.Code, http.StatusCreated, createTaskResp.Body.String())
	}

	createSubTaskResp := doJSON(router, http.MethodPost, "/api/tasks/1/sub-tasks", `{"title":"First sub task"}`, true)
	if createSubTaskResp.Code != http.StatusCreated {
		t.Fatalf("create sub-task status = %d, want %d; body = %s", createSubTaskResp.Code, http.StatusCreated, createSubTaskResp.Body.String())
	}
	secondSubTaskResp := doJSON(router, http.MethodPost, "/api/tasks/1/sub-tasks", `{"title":"Second sub task"}`, true)
	if secondSubTaskResp.Code != http.StatusCreated {
		t.Fatalf("create second sub-task status = %d, want %d; body = %s", secondSubTaskResp.Code, http.StatusCreated, secondSubTaskResp.Body.String())
	}

	var created struct {
		Data struct {
			ID     int64  `json:"id"`
			TaskID int64  `json:"task_id"`
			Status string `json:"status"`
		} `json:"data"`
	}
	if err := json.Unmarshal(createSubTaskResp.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode create sub-task response: %v", err)
	}
	if created.Data.ID != 1 || created.Data.TaskID != 1 || created.Data.Status != "active" {
		t.Fatalf("unexpected created sub-task: %+v", created.Data)
	}

	updateSubTaskResp := doJSON(router, http.MethodPut, "/api/tasks/1/sub-tasks/1", `{"status":"completed"}`, true)
	if updateSubTaskResp.Code != http.StatusOK {
		t.Fatalf("update sub-task status = %d, want %d; body = %s", updateSubTaskResp.Code, http.StatusOK, updateSubTaskResp.Body.String())
	}

	listSubTasksResp := doJSON(router, http.MethodGet, "/api/tasks/1/sub-tasks", "", true)
	if listSubTasksResp.Code != http.StatusOK {
		t.Fatalf("list sub-task status = %d, want %d; body = %s", listSubTasksResp.Code, http.StatusOK, listSubTasksResp.Body.String())
	}

	var listed struct {
		Data []struct {
			ID     int64  `json:"id"`
			Status string `json:"status"`
		} `json:"data"`
	}
	if err := json.Unmarshal(listSubTasksResp.Body.Bytes(), &listed); err != nil {
		t.Fatalf("decode list sub-task response: %v", err)
	}
	if len(listed.Data) != 2 || listed.Data[0].ID != 1 || listed.Data[0].Status != "completed" {
		t.Fatalf("unexpected listed sub-tasks: %+v", listed.Data)
	}

	listTasksResp := doJSON(router, http.MethodGet, "/api/tasks", "", true)
	if listTasksResp.Code != http.StatusOK {
		t.Fatalf("list task status = %d, want %d; body = %s", listTasksResp.Code, http.StatusOK, listTasksResp.Body.String())
	}
	var listedTasks struct {
		Data []struct {
			ID int64 `json:"id"`
		} `json:"data"`
	}
	if err := json.Unmarshal(listTasksResp.Body.Bytes(), &listedTasks); err != nil {
		t.Fatalf("decode list task response: %v", err)
	}
	if len(listedTasks.Data) != 1 || listedTasks.Data[0].ID != 1 {
		t.Fatalf("unexpected task sub-task count: %+v", listedTasks.Data)
	}

	deleteSubTaskResp := doJSON(router, http.MethodDelete, "/api/tasks/1/sub-tasks/1", "", true)
	if deleteSubTaskResp.Code != http.StatusOK {
		t.Fatalf("delete sub-task status = %d, want %d; body = %s", deleteSubTaskResp.Code, http.StatusOK, deleteSubTaskResp.Body.String())
	}
}

func testRouter() http.Handler {
	taskRepository := repository.NewTaskRepository()
	subTaskRepository := repository.NewSubTaskRepository()
	taskService := service.NewTaskService(taskRepository, subTaskRepository)
	taskController := controller.NewTaskController(taskService)
	subTaskService := service.NewSubTaskService(taskRepository, subTaskRepository)
	subTaskController := controller.NewSubTaskController(subTaskService)

	authService := service.NewAuthService()
	authController := controller.NewAuthController(authService)

	return NewRouter(authController, taskController, subTaskController, authService)
}

func doJSON(handler http.Handler, method, path, body string, authenticated bool) *httptest.ResponseRecorder {
	var reqBody *bytes.Buffer
	if body == "" {
		reqBody = bytes.NewBuffer(nil)
	} else {
		reqBody = bytes.NewBufferString(body)
	}

	req := httptest.NewRequest(method, path, reqBody)
	if authenticated {
		req.Header.Set("Authorization", "Bearer "+service.DummyToken)
	}
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}

	resp := httptest.NewRecorder()
	handler.ServeHTTP(resp, req)
	return resp
}
