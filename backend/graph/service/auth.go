package service

import (
	"context"

	"github.com/acad600/WEB-NC-231/graph/model"
)

var jwtToken string

func UserLogin(ctx context.Context, email string, password string, ID string, inputtedPass string) (string, error) {
	if !model.CheckPasswordHash(inputtedPass, password) {
		return "", nil
	}
	token, err := JwtGenerate(ctx, ID)

	if err != nil {
		return "", err
	}
	// ctx = context.WithValue(ctx, "auth", token)
	return token, nil
}
