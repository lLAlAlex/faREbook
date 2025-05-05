package model

type Post struct {
	ID     string `json:"id" gorm:"primaryKey"`
	UserID string `json:"userID"`
	// User    *User  `json:"user"`
	Content string `json:"content"`
	// Images    []*PostImage `json:"images"`
	// Videos    []*PostVideo `json:"videos"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Comments  int    `json:"comments"`
	// Tags      []string     `json:"tags"`
}

type PostImage struct {
	ID     string `json:"id"`
	ImageLink  string `json:"imageLink"`
	PostID string `json:"postID"`
	// Post   *Post  `json:"post"`
}

type PostVideo struct {
	ID     string `json:"id"`
	VideoLink  string `json:"videoLink"`
	PostID string `json:"postID"`
	// Post   *Post  `json:"post"`
}

type PostTag struct {
	ID     string `json:"id"`
	UserID string `json:"userID"`
	// User   *User  `json:"user"`
	Tag    string `json:"tag"`
	PostID string `json:"postID"`
}

type PostLike struct {
	ID     string `json:"id"`
	UserID string `json:"userID"`
	PostID string `json:"postID"`
}

type PostComment struct {
	ID        string `json:"id"`
	Comment   string `json:"comment"`
	UserID    string `json:"userID"`
	PostID    string `json:"postID"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Replies   int    `json:"replies"`
}
