package main

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"
)

const APP_JSON_PATH = "../app.json"
const PACKAGE_JSON_PATH = "../package.json"

func main() {
	// Update app.json version
	if err := updateAppJsonVersion(); err != nil {
		fmt.Printf("Error updating app.json: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("app.json updated successfully")

	// Update package.json version
	if err := updatePackageJsonVersion(); err != nil {
		fmt.Printf("Error updating package.json: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("package.json updated successfully")
}

func updateAppJsonVersion() error {
	appJson, err := os.ReadFile(APP_JSON_PATH)
	if err != nil {
		return fmt.Errorf("error opening file: %v", err)
	}

	fmt.Println("app.json opened successfully")

	// Remove comments for parsing (but keep original for writing back)
	original := string(appJson)
	cleaned := removeJSONComments(original)

	// Parse JSON
	var t any
	err = json.Unmarshal([]byte(cleaned), &t)
	if err != nil {
		return fmt.Errorf("error parsing JSON: %v", err)
	}

	// Get current version
	m := t.(map[string]any)
	expo, ok := m["expo"].(map[string]any)
	if !ok {
		return fmt.Errorf("'expo' field not found")
	}

	version, ok := expo["version"].(string)
	if !ok {
		return fmt.Errorf("'version' field not found")
	}

	fmt.Println("Current App Version:", version)

	// Parse and increment patch version
	newVersion, err := bumpPatchVersion(version)
	if err != nil {
		return err
	}

	fmt.Println("New App Version:", newVersion)

	// Update version in original file
	versionRegex := regexp.MustCompile(`("version"\s*:\s*)"` + regexp.QuoteMeta(version) + `"`)
	updated := versionRegex.ReplaceAllString(original, `$1"`+newVersion+`"`)

	// Write back to file
	err = os.WriteFile(APP_JSON_PATH, []byte(updated), 0644)
	if err != nil {
		return fmt.Errorf("error writing app.json: %v", err)
	}

	// Also update version.ts
	err = updateVersionTS(newVersion)
	if err != nil {
		return err
	}

	return nil
}

func updatePackageJsonVersion() error {
	packageJson, err := os.ReadFile(PACKAGE_JSON_PATH)
	if err != nil {
		return fmt.Errorf("error opening file: %v", err)
	}

	fmt.Println("package.json opened successfully")

	// Remove comments for parsing (but keep original for writing back)
	original := string(packageJson)
	cleaned := removeJSONComments(original)

	// Parse JSON
	var t any
	err = json.Unmarshal([]byte(cleaned), &t)
	if err != nil {
		return fmt.Errorf("error parsing JSON: %v", err)
	}

	// Get current version (directly from root in package.json)
	m := t.(map[string]any)
	version, ok := m["version"].(string)
	if !ok {
		return fmt.Errorf("'version' field not found in package.json")
	}

	fmt.Println("Current Package Version:", version)

	// Parse and increment patch version
	newVersion, err := bumpPatchVersion(version)
	if err != nil {
		return err
	}

	fmt.Println("New Package Version:", newVersion)

	// Update version in original file
	versionRegex := regexp.MustCompile(`("version"\s*:\s*)"` + regexp.QuoteMeta(version) + `"`)
	updated := versionRegex.ReplaceAllString(original, `$1"`+newVersion+`"`)

	// Write back to file
	err = os.WriteFile(PACKAGE_JSON_PATH, []byte(updated), 0644)
	return err
}

func updateVersionTS(newVersion string) error {
	versionTSPath := "../version/version.ts"
	content := fmt.Sprintf(`export const APP_VERSION = "%s";
`, newVersion)

	err := os.WriteFile(versionTSPath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("error writing version.ts: %v", err)
	}

	fmt.Println("version.ts updated successfully")
	return nil
}

func bumpPatchVersion(version string) (string, error) {
	var major, minor, patch int
	_, err := fmt.Sscanf(version, "%d.%d.%d", &major, &minor, &patch)
	if err != nil {
		return "", fmt.Errorf("error parsing version: %v", err)
	}
	patch++
	return fmt.Sprintf("%d.%d.%d", major, minor, patch), nil
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