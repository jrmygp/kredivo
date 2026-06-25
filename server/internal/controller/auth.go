package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"task-management-server/internal/dto"
	"task-management-server/internal/service"
)

type AuthController struct {
	service service.AuthService
}

func NewAuthController(service service.AuthService) *AuthController {
	return &AuthController{service}
}

func (h *AuthController) Login(c *gin.Context) {
	var loginForm dto.LoginRequest

	err := c.ShouldBindJSON(&loginForm)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	token, userID := h.service.Login(loginForm.Username, loginForm.Password)
	webResponse := dto.Response{
		Code:   http.StatusOK,
		Status: "OK",
		Data: dto.LoginResponse{
			Token:  token,
			UserID: userID,
		},
	}

	c.JSON(http.StatusOK, webResponse)
}
