// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type NewConversation struct {
	UserID  string `json:"userID"`
	User2id string `json:"user2ID"`
}

type NewGroup struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdAt"`
	CreatorID   string `json:"creatorID"`
	Status      string `json:"status"`
}

type NewGroupPost struct {
	UserID    string `json:"userID"`
	GroupID   string `json:"groupID"`
	Content   string `json:"content"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Comments  int    `json:"comments"`
}

type NewMessage struct {
	ConversationID string `json:"conversationID"`
	UserID         string `json:"userID"`
	Content        string `json:"content"`
	HasMedia       bool   `json:"hasMedia"`
}

type NewNotification struct {
	UserID    string `json:"userID"`
	SenderID  string `json:"senderID"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
}

type NewPost struct {
	UserID    string `json:"userID"`
	Content   string `json:"content"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Comments  int    `json:"comments"`
}

type NewReel struct {
	UserID    string `json:"userID"`
	Title     string `json:"title"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Comments  int    `json:"comments"`
}

type NewStory struct {
	UserID    string `json:"userID"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
}

type NewUser struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Dob      string `json:"dob"`
	Gender   string `json:"gender"`
	Password string `json:"password"`
	Status   string `json:"status"`
}
