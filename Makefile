BIN = $(CURDIR)/bin

.PHONY: clean
clean:
	rm -rf deploy

.PHONY: deploy-prep
deploy-prep: clean build

.PHONY: build
build:
	npm ci
	npm run build


.PHONY: init-darwin
init-darwin: install
	@mkdir -p $(BIN)
	cd $(BIN) && curl -L https://github.com/caddyserver/caddy/releases/download/v2.4.6/caddy_2.4.6_mac_arm64.tar.gz  | tar xvz

.PHONY: init-linux
init-linux: install
	@mkdir -p $(BIN)
	cd $(BIN) && curl -L https://github.com/caddyserver/caddy/releases/download/v2.4.6/caddy_2.4.6_linux_amd64.tar.gz  | tar xvz

.PHONY: init-windows
init-windows:
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
	sudo ./bin/caddy run

.PHONY: lb-disown
lb-disown:
	./bin/caddy run & disown

.PHONY: wt
wt:
	wt --window 0 --tabColor #4747E2 --title "Passport Web - Watch" -p "PowerShell" -d ./ powershell -NoExit "make watch" ; split-pane --tabColor #4747E2 --title "Passport Web - Load Balancer" -p "PowerShell" -d ./ powershell -NoExit "make lb"
