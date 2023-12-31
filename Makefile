.PHONY: compile
compile: stop
	yarn run tsc

.PHONY: start
start: stop
	# To start a development live-reload server:
	yarn run dev

.PHONY: stop
stop:
	$(eval PIDS := $(shell lsof -t -i :8080))
	if [ -n "$(PIDS)" ]; then kill -9 $(PIDS); fi

.PHONY: clean
clean:
	rm -Rf build
	rm -Rf *.tar

.PHONY: clean build
build:
	# To create a production build (in ./build):
	yarn run build

.PHONY: build-tar
build-tar: clean
	$(eval VERSION=$(shell git log --format=format:%H -1))
	yarn run build
	echo "Version $(VERSION)"
	cd build && tar -cvf build-$(VERSION).tar *
	mv -v build/*.tar .

.PHONY: serve stop
serve: build
	# To start a production HTTP/2 server:
	yarn run serve --host

.PHONY: icons
icons:
	convert -density 600 src/assets/logo.svg -resize 256x256 favicon-256.png
	convert -density 600 src/assets/logo.svg -resize 16x16 favicon-16.png
	convert -density 600 src/assets/logo.svg -resize 32x32 favicon-32.png
	convert -density 600 src/assets/logo.svg -resize 64x64 favicon-64.png
	convert -density 600 src/assets/logo.svg -resize 128x128 favicon-128.png
	convert favicon-16.png favicon-32.png favicon-64.png favicon-128.png favicon-256.png -colors 256 src/assets/favicon.ico

	convert -density 600 -background transparent -resize 192x192 src/assets/logo.svg src/assets/icons/android-chrome-192x192.png
	convert -density 600 -background transparent -resize 512x512 src/assets/logo.svg src/assets/icons/android-chrome-512x512.png
	convert -density 600 -background transparent -resize 180x180 src/assets/logo.svg src/assets/icons/apple-touch-icon.png
	convert -density 600 -background transparent -resize 16x16 src/assets/logo.svg src/assets/icons/favicon-16x16.png
	convert -density 600 -background transparent -resize 32x32 src/assets/logo.svg src/assets/icons/favicon-32x32.png
	convert -density 600 -background transparent -resize 150x150 src/assets/logo.svg src/assets/icons/mstile-150x150.png
