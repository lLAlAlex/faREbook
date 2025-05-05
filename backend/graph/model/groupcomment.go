package model

type GroupCommentLike struct {
	ID             string `json:"id"`
	UserID         string `json:"userID"`
	GroupCommentID string `json:"groupCommentID"`
}

type GroupCommentReply struct {
	ID             string `json:"id"`
	Reply          string `json:"reply"`
	UserID         string `json:"userID"`
	CreatedAt      string `json:"createdAt"`
	GroupCommentID string `json:"groupCommentID"`
	Likes          int    `json:"likes"`
}
