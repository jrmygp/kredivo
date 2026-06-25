package config

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"task-management-server/internal/controller"
	"task-management-server/internal/middleware"
	"task-management-server/internal/service"
)

func NewRouter(authController *controller.AuthController, taskController *controller.TaskController, authService service.AuthService) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Authorization", "Content-Type"},
	}))

	api := router.Group("/api")
	api.POST("/login", authController.Login)

	task := api.Group("/tasks")
	task.Use(middleware.RequireAuth(authService))
	task.GET("", taskController.FindAll)
	task.POST("", taskController.Create)
	task.PUT("/:id", taskController.Update)
	task.DELETE("/:id", taskController.Delete)

	return router
}
