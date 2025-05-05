package database

import (
	"github.com/acad600/WEB-NC-231/graph/model"
	"github.com/acad600/WEB-NC-231/helper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var database *gorm.DB

const defaultDatabase = "host=localhost user=gorm password=gorm dbname=gorm port=9920 sslmode=disable TimeZone=Asia/Shanghai"

func GetInstance() *gorm.DB {
	if database == nil {
		dsn := helper.GoDotEnvVariable("DATABASE_URL")
		if dsn == "" {
			dsn = defaultDatabase
		}
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			panic(err)
		}
		database = db
	}
	return database
}

func MigrateTable() {
	db := GetInstance()
	db.AutoMigrate(&model.User{})
	db.AutoMigrate(&model.UserProfile{})
	db.AutoMigrate(&model.UserProfileCover{})
	db.AutoMigrate(&model.Post{})
	db.AutoMigrate(&model.PostImage{})
	db.AutoMigrate(&model.PostVideo{})
	db.AutoMigrate(&model.PostTag{})
	db.AutoMigrate(&model.PostLike{})
	db.AutoMigrate(&model.PostComment{})
	db.AutoMigrate(&model.CommentLike{})
	db.AutoMigrate(&model.CommentReply{})
	db.AutoMigrate(&model.Story{})
	db.AutoMigrate(&model.StoryMedia{})
	db.AutoMigrate(&model.Friend{})
	db.AutoMigrate(&model.FriendRequest{})
	db.AutoMigrate(&model.Reel{})
	db.AutoMigrate(&model.ReelVideo{})
	db.AutoMigrate(&model.ReelComment{})
	db.AutoMigrate(&model.ReelLike{})
	db.AutoMigrate(&model.ReelCommentReply{})
	db.AutoMigrate(&model.ReelCommentLike{})
	db.AutoMigrate(&model.Notification{})
	db.AutoMigrate(&model.Conversation{})
	db.AutoMigrate(&model.Message{})
	db.AutoMigrate(&model.MessageMedia{})
	db.AutoMigrate(&model.Group{})
	db.AutoMigrate(&model.Member{})
	db.AutoMigrate(&model.RequestedMember{})
	db.AutoMigrate(&model.GroupProfile{})
	db.AutoMigrate(&model.MemberInvite{})
	db.AutoMigrate(&model.GroupPost{})
	db.AutoMigrate(&model.GroupPostComment{})
	db.AutoMigrate(&model.GroupPostLike{})
	db.AutoMigrate(&model.GroupPostMedia{})
	db.AutoMigrate(&model.GroupCommentLike{})
	db.AutoMigrate(&model.GroupCommentReply{})
}
