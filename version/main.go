package main

import (
	"encoding/json"
	"fmt"
	"os"
)

const APP_JSON_PATH = "../app.json"

func main() {
	appJson, err := os.ReadFile(APP_JSON_PATH)
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		os.Exit(1)
	}
	appJsonData := string(appJson)

	fmt.Println("app.json opened successfully")

	var t any
	err = json.Unmarshal([]byte(appJsonData), &t)

	if err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
		os.Exit(1)
	}

	m := t.(map[string]any)
	version := m["version"].(string)

	fmt.Println("Version:", version)

}
