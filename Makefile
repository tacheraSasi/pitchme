run:
	bun start -c

build-version-manager:
	go build -o ./version/version-manager ./version/main.go

update-version: build-version-manager
	cd ./version && ./version-manager

build-apk: update-version
	bunx eas build -p android --profile preview