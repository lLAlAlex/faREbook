package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/acad600/WEB-NC-231/database"
	"github.com/acad600/WEB-NC-231/graph"
	"github.com/gorilla/websocket"
)

const defaultPort = "8080"

var Conns = map[string]*websocket.Conn{}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	database.MigrateTable()

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{DB: database.GetInstance(), Conns: Conns}}))

	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", srv)

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
		 	return true
		},
	}
	  
	http.HandleFunc("/websocket", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
		 	return
		}
		defer conn.Close()
	  
		identifier, err := generateIdentifier(10)

		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		Conns[identifier] = conn
	  
		for {
			messageType, p, err := conn.ReadMessage()
			fmt.Println(messageType, p, err)

			if err != nil {
				delete(Conns, identifier)
				return
			}

			for _, conn := range Conns {
				if err := conn.WriteMessage(messageType, p); err != nil {
					delete(Conns, identifier)
					conn.Close()
				}
			}
		}
	})

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func generateIdentifier(length int) (string, error) {
	buffer := make([]byte, length)
	_, err := rand.Read(buffer)
	
	if err != nil {
	 	return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buffer), nil
}