package main

import (
	"fmt"
	"os"
)

const APP_JSON_PATH = "../app.json"

func main(){
	appJson, err := os.ReadFile(APP_JSON_PATH)
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		os.Exit(1)
	}
	appJsonData := string(appJson)

	fmt.Println("app.json opened successfully")
	fmt.Println("File path:", APP_JSON_PATH)
	fmt.Println("File data", appJsonData)
	if len(os.Args) != 2 {
		fmt.Println("Usage: bump-version <version>")
		os.Exit(1)
	}

	version := os.Args[1]
	fmt.Printf("Bumping version to %s\n", version)
	os.Exit(0)
}