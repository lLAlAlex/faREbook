package model

type GroupPost struct {
	ID        string `json:"id"`
	GroupID   string `json:"groupID"`
	UserID    string `json:"userID"`
	Content   string `json:"content"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Comments  int    `json:"comments"`
}

type GroupPostComment struct {
	ID          string `json:"id"`
	Comment     string `json:"comment"`
	UserID      string `json:"userID"`
	GroupPostID string `json:"groupPostID"`
	CreatedAt   string `json:"createdAt"`
	Likes       int    `json:"likes"`
	Replies     int    `json:"replies"`
}

type GroupPostLike struct {
	ID          string `json:"id"`
	UserID      string `json:"userID"`
	GroupPostID string `json:"groupPostID"`
}

type GroupPostMedia struct {
	ID          string `json:"id"`
	MediaLink   string `json:"mediaLink"`
	GroupPostID string `json:"groupPostID"`
}
