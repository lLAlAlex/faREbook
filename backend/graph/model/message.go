package model

type Conversation struct {
	ID        string `json:"id"`
	UserID    string `json:"userID"`
	User2id   string `json:"user2ID"`
	CreatedAt string `json:"createdAt"`
}

type Message struct {
	ID             string `json:"id"`
	ConversationID string `json:"conversationID"`
	UserID         string `json:"userID"`
	Content        string `json:"content"`
	CreatedAt      string `json:"createdAt"`
	HasMedia       bool   `json:"hasMedia"`
}

type MessageMedia struct {
	ID        string `json:"id"`
	MessageID string `json:"messageID"`
	MediaLink string `json:"mediaLink"`
}