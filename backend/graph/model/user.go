package model

import "golang.org/x/crypto/bcrypt"

type User struct {
	ID       string `json:"id" gorm:"primaryKey"`
	Name     string `json:"name"`
	Email    string `json:"email" gorm:"unique"`
	Dob      string `json:"dob"`
	Gender   string `json:"gender"`
	Password string `json:"password"`
	Status   string `json:"status"`
}

type UserProfile struct {
	ID        string `json:"id"`
	UserID    string `json:"userID"`
	ImageLink string `json:"imageLink"`
}

type UserProfileCover struct {
	ID        string `json:"id"`
	UserID    string `json:"userID"`
	ImageLink string `json:"imageLink"`
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
