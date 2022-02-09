# Passport-Web


### Envars
```shell
REACT_APP_PASSPORT_API_ENDPOINT_HOSTNAME=
XGRID_LICENSE_KEY=

# Not needed for develop
REACT_APP_SENTRY_DSN_FRONTEND=
REACT_APP_SENTRY_CURRENT_RELEASE_NAME=syndicate-passport_web@version # client-project@version (snake_case)
REACT_APP_SENTRY_ENVIRONMENT=
REACT_APP_SENTRY_SAMPLERATE=
```

### To init
```shell
make init-linux
or
make init-windows
```

### To run
```shell
1. Have passport-server running on 8086
2. make lb
3. make watch

Connect to http://localhost:5003
```
