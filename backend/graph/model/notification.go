package model

type Notification struct {
	ID        string `json:"id" gorm:"primaryKey"`
	UserID    string `json:"userID"`
	SenderID  string `json:"senderID"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
}
