package main

import (
	"task-management-server/config"
	"task-management-server/internal/controller"
	"task-management-server/internal/repository"
	"task-management-server/internal/service"
)

func main() {
	taskRepository := repository.NewTaskRepository()
	taskService := service.NewTaskService(taskRepository)
	taskController := controller.NewTaskController(taskService)

	authService := service.NewAuthService()
	authController := controller.NewAuthController(authService)

	router := config.NewRouter(authController, taskController, authService)

	router.Run(":8080")
}
