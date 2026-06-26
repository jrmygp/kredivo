package service

const (
	DummyToken = "crF7eD6xtrte8oFQUK7su3cDBL6JyWcSrqxdHgkzeDYarzOAX5VSpzh55BbRlaHO"
	DemoUserID = "5edc74b5-c33c-44ef-8c7d-0f16444d2e85"
)

type AuthService interface {
	Login(username, password string) (string, string)
	ValidateToken(token string) (string, bool)
}
