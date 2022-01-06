BIN = $(CURDIR)/bin

.PHONY: init-linux
init-linux: install
	@mkdir -p $(BIN)
	cd $(BIN) && curl -L https://github.com/caddyserver/caddy/releases/download/v2.4.6/caddy_2.4.6_linux_amd64.tar.gz  | tar xvz

.PHONY: init-windows
init:
	install
	cd $(BIN) && Invoke-WebRequest -Uri "https://github.com/caddyserver/caddy/releases/download/v2.4.6/caddy_2.4.6_windows_amd64.zip" -OutFile "./caddy_2.4.6_windows_amd64.zip" -UseBasicParsing
	cd $(BIN) && Expand-Archive './caddy_2.4.6_windows_amd64.zip' -DestinationPath './' && rm './caddy_2.4.6_windows_amd64.zip'


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

.PHONY: wt
wt:
	wt --window 0 --tabColor #4747E2 --title "Boilerplate - Server" -p "PowerShell" -d ./server powershell -NoExit "${BIN}/arelo -p '**/*.go' -i '**/.*' -i '**/*_test.go' -i 'tools/*' -- go run cmd/platform/main.go serve" ; split-pane --tabColor #4747E2 --title "Boilerplate - Load Balancer" -p "PowerShell" -d ./ powershell -NoExit make lb ; split-pane -H -s 0.8 --tabColor #4747E2 --title "Boilerplate - Admin Frontend" --suppressApplicationTitle -p "PowerShell" -d ./web powershell -NoExit "$$env:BROWSER='none' \; npm run admin-start" ; split-pane -H -s 0.5 --tabColor #4747E2 --title "Boilerplate - Public Frontend" --suppressApplicationTitle -p "PowerShell" -d ./web powershell -NoExit "$$env:BROWSER='none' \; npm run public-start"
