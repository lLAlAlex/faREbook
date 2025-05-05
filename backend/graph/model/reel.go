package model

type Reel struct {
	ID        string `json:"id" gorm:"primaryKey"`
	UserID    string `json:"userID"`
	Title     string `json:"title"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Comments  int    `json:"comments"`
}

type ReelVideo struct {
	ID        string `json:"id"`
	ReelID    string `json:"reelID"`
	VideoLink string `json:"videoLink"`
}

type ReelComment struct {
	ID        string `json:"id"`
	UserID    string `json:"userID"`
	ReelID    string `json:"reelID"`
	Comment   string `json:"comment"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Replies   int    `json:"replies"`
}

type ReelLike struct {
	ID     string `json:"id"`
	UserID string `json:"userID"`
	ReelID string `json:"reelID"`
}

type ReelCommentReply struct {
	ID        string `json:"id"`
	UserID    string `json:"userID"`
	CommentID string `json:"commentID"`
	Reply     string `json:"reply"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
}

type ReelCommentLike struct {
	ID        string `json:"id"`
	UserID    string `json:"userID"`
	CommentID string `json:"commentID"`
}