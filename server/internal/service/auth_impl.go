package service

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
