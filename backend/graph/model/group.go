package model

type Group struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdAt"`
	CreatorID   string `json:"creatorID"`
	Status      string `json:"status"`
}

type GroupProfile struct {
	ID        string `json:"id"`
	GroupID   string `json:"groupID"`
	ImageLink string `json:"imageLink"`
}

type Member struct {
	ID       string `json:"id"`
	UserID   string `json:"userID"`
	GroupID  string `json:"groupID"`
	JoinedAt string `json:"joinedAt"`
	Role     string `json:"role"`
}

type RequestedMember struct {
	ID      string `json:"id"`
	UserID  string `json:"userID"`
	GroupID string `json:"groupID"`
}

type MemberInvite struct {
	ID       string `json:"id"`
	UserID   string `json:"userID"`
	SenderID string `json:"senderID"`
	GroupID  string `json:"groupID"`
}
