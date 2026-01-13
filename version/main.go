package main

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"
)

const APP_JSON_PATH = "../app.json"

func main() {
	appJson, err := os.ReadFile(APP_JSON_PATH)
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("app.json opened successfully")

	// I Remove comments for parsing (but i keep original for writing back)
	original := string(appJson)
	cleaned := removeJSONComments(original)

	// Parse JSON
	var t any
	err = json.Unmarshal([]byte(cleaned), &t)
	if err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
		os.Exit(1)
	}

	// Get current version
	m := t.(map[string]any)
	expo, ok := m["expo"].(map[string]any)
	if !ok {
		fmt.Println("Error: 'expo' field not found")
		os.Exit(1)
	}

	version, ok := expo["version"].(string)
	if !ok {
		fmt.Println("Error: 'version' field not found")
		os.Exit(1)
	}

	fmt.Println("Current Version:", version)

	// Parse and increment patch version
	var major, minor, patch int
	_, err = fmt.Sscanf(version, "%d.%d.%d", &major, &minor, &patch)
	if err != nil {
		fmt.Printf("Error parsing version: %v\n", err)
		os.Exit(1)
	}

	patch++
	newVersion := fmt.Sprintf("%d.%d.%d", major, minor, patch)

	fmt.Println("New Version:", newVersion)

	// I update version in original file
	versionRegex := regexp.MustCompile(`("version"\s*:\s*)"` + regexp.QuoteMeta(version) + `"`)
	updated := versionRegex.ReplaceAllString(original, `$1"`+newVersion+`"`)

	// Write back to file
	err = os.WriteFile(APP_JSON_PATH, []byte(updated), 0644)
	if err != nil {
		fmt.Printf("Error writing file: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("app.json updated successfully")
}

// removeJSONComments strips // comments from JSON content
func removeJSONComments(content string) string {
	lines := strings.Split(content, "\n")
	var cleaned []string

	for _, line := range lines {
		// Find // comment position (not inside strings)
		inString := false
		escaped := false
		commentPos := -1

		for i, ch := range line {
			if escaped {
				escaped = false
				continue
			}

			if ch == '\\' {
				escaped = true
				continue
			}

			if ch == '"' {
				inString = !inString
				continue
			}

			if !inString && i < len(line)-1 && ch == '/' && line[i+1] == '/' {
				commentPos = i
				break
			}
		}

		if commentPos >= 0 {
			line = strings.TrimRight(line[:commentPos], " \t")
		}

		// Keep line if it has content after removing comment
		if strings.TrimSpace(line) != "" {
			cleaned = append(cleaned, line)
		}
	}

	return strings.Join(cleaned, "\n")
}

func setVersion(major, minor, patch int) string {
	return fmt.Sprintf("%d.%d.%d", major, minor, patch)
}
func bumpMajor(version string) (string, error) {
	var major, minor, patch int
	_, err := fmt.Sscanf(version, "%d.%d.%d", &major, &minor, &patch)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%d.0.0", major+1), nil
}

func bumpMinor(version string) (string, error) {
	var major, minor, patch int
	_, err := fmt.Sscanf(version, "%d.%d.%d", &major, &minor, &patch)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%d.%d.0", major, minor+1), nil
}