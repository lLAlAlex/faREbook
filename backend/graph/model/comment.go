package model

type CommentLike struct {
	ID        string `json:"id"`
	UserID    string `json:"userID"`
	CommentID string `json:"commentID"`
}

type CommentReply struct {
	ID        string `json:"id"`
	Reply     string `json:"reply"`
	UserID    string `json:"userID"`
	CreatedAt string `json:"createdAt"`
	CommentID string `json:"commentID"`
	Likes     int    `json:"likes"`
}
