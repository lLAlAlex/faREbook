package service

import (
	"context"

	"github.com/acad600/WEB-NC-231/database"
	"github.com/acad600/WEB-NC-231/graph/model"
	"github.com/google/uuid"
)

func UserCreate(ctx context.Context, input model.NewUser) (*model.User, error) {
	db := database.GetInstance()

	password, err := model.HashPassword(input.Password)

	if err != nil {
		return nil, err
	}

	user := &model.User{
		ID:       uuid.NewString(),
		Name:     input.Name,
		Email:    input.Email,
		Password: password,
		Gender:   input.Gender,
		Dob:      input.Dob,
		Status:   "Unavailable",
	}

	if err := db.Model(user).Create(&user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

func UserGetByID(ctx context.Context, id string) (*model.User, error) {
	db := database.GetInstance()

	var user model.User
	if err := db.Model(user).Where("id = ?", id).Take(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func UserGetByEmail(ctx context.Context, email string) (*model.User, error) {
	db := database.GetInstance()

	var user model.User
	if err := db.Model(user).Where("email = ?", email).Take(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}
