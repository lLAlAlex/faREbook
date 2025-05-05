package model

type Story struct {
	ID        string `json:"id" gorm:"primaryKey"`
	UserID    string `json:"userID"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
}

type StoryMedia struct {
	ID        string `json:"id"`
	MediaLink string `json:"imageLink"`
	StoryID   string `json:"postID"`
}