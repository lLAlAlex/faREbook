package model

type Friend struct {
	ID       string `json:"id" gorm:"primaryKey"`
	UserID   string `json:"userID"`
	FriendID string `json:"friendID"`
}

type FriendRequest struct {
	ID              string `json:"id"`
	UserID          string `json:"userID"`
	RequestedUserID string `json:"RequestedUserID"`
}
