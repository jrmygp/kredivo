package service

const (
	DummyToken = "dummy-jwt-token"
	DemoUserID = "demo-user"
)

type AuthService interface {
	Login(username, password string) (string, string)
	ValidateToken(token string) (string, bool)
}

type authService struct{}

func NewAuthService() *authService {
	return &authService{}
}

func (s *authService) Login(_, _ string) (string, string) {
	return DummyToken, DemoUserID
}

func (s *authService) ValidateToken(token string) (string, bool) {
	if token != DummyToken {
		return "", false
	}

	return DemoUserID, true
}
