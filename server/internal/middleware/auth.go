package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"task-management-server/internal/dto"
	"task-management-server/internal/service"
)

func RequireAuth(authService service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		scheme, token, ok := strings.Cut(c.GetHeader("Authorization"), " ")
		if !ok || !strings.EqualFold(scheme, "Bearer") {
			c.JSON(http.StatusUnauthorized, dto.Response{
				Code:   http.StatusUnauthorized,
				Status: "Unauthorized",
				Error:  "unauthorized",
			})
			c.Abort()
			return
		}

		userID, valid := authService.ValidateToken(token)
		if !valid {
			c.JSON(http.StatusUnauthorized, dto.Response{
				Code:   http.StatusUnauthorized,
				Status: "Unauthorized",
				Error:  "unauthorized",
			})
			c.Abort()
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}
