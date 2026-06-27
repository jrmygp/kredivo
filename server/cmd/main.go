package main

import (
	"task-management-server/internal/controller"
	"task-management-server/internal/repository"
	"task-management-server/internal/router"
	"task-management-server/internal/service"
)

func main() {
	taskRepository := repository.NewTaskRepository()
	subTaskRepository := repository.NewSubTaskRepository()
	taskService := service.NewTaskService(taskRepository, subTaskRepository)
	taskController := controller.NewTaskController(taskService)
	subTaskService := service.NewSubTaskService(taskRepository, subTaskRepository)
	subTaskController := controller.NewSubTaskController(subTaskService)

	authService := service.NewAuthService()
	authController := controller.NewAuthController(authService)

	router := router.NewRouter(authController, taskController, subTaskController, authService)

	router.Run(":8080")
}
