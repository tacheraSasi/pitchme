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
	version := m["expo"].(map[string]any)["version"].(string)

	fmt.Println("Version:", version)

	// I need to increment the patch version
	var major, minor, patch int
	_, err = fmt.Sscanf(version, "%d.%d.%d", &major, &minor, &patch)
	if err != nil {
		fmt.Printf("Error parsing version: %v\n", err)
		os.Exit(1)
	}

	patch++
	newVersion := fmt.Sprintf("%d.%d.%d", major, minor, patch)
	m["expo"].(map[string]any)["version"] = newVersion

	fmt.Println("New Version:", newVersion)

	updatedJsonData, err := json.MarshalIndent(m, "", "  ")
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		os.Exit(1)
	}

	err = os.WriteFile(APP_JSON_PATH, updatedJsonData, 0644)
	if err != nil {
		fmt.Printf("Error writing file: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("app.json updated successfully")

}
