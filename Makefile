run:
	bun start -c

	
build-apk:
	bunx eas build -p android --profile preview

build-version-manager:
	go build -o ./version/version-manager ./version/main.go

update-version:
	cd ./version && ./version-manager