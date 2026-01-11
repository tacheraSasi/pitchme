package main

import (
	"fmt"
	"os"
)

func main(){
	if len(os.Args) != 2 {
		fmt.Println("Usage: bump-version <version>")
		os.Exit(1)
	}

	version := os.Args[1]
	fmt.Printf("Bumping version to %s\n", version)
	os.Exit(0)
}