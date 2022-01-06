BIN = $(CURDIR)/bin

.PHONY: init-linux
init-linux: install
	@mkdir -p $(BIN)
	cd $(BIN) && curl -L https://github.com/caddyserver/caddy/releases/download/v2.4.6/caddy_2.4.6_linux_amd64.tar.gz  | tar xvz

.PHONY: init-windows
init:
	install
	-mkdir bin
	cd $(BIN) && powershell Invoke-WebRequest -Uri "https://github.com/caddyserver/caddy/releases/download/v2.4.6/caddy_2.4.6_windows_amd64.zip" -OutFile "./caddy_2.4.6_windows_amd64.zip" -UseBasicParsing
	cd $(BIN) && powershell Expand-Archive './caddy_2.4.6_windows_amd64.zip' -DestinationPath './' && powershell rm './caddy_2.4.6_windows_amd64.zip'


.PHONY: install
install:
	 npm install

.PHONY: translate
translate:
	npm run translate

.PHONY: watch
watch:
	npm run start

.PHONY: lb
lb:
	./bin/caddy run
