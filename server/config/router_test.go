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
		Data []struct {
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

func testRouter() http.Handler {
	taskRepository := repository.NewTaskRepository()
	taskService := service.NewTaskService(taskRepository)
	taskController := controller.NewTaskController(taskService)

	authService := service.NewAuthService()
	authController := controller.NewAuthController(authService)

	return NewRouter(authController, taskController, authService)
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
