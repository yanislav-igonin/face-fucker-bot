# Face Fucker Bot

## Try out
[Deployed bot](t.me/face_fucker_bot)

## Startup

In development you can use webhook or not to check how it works. On production it's preferable to use webhook in swarm mode, so `IS_WEBHOOK_DISABLED` variable default is `false`, but there also `docker-compose` version with polling where `IS_WEBHOOK_DISABLED` variable default is `true`.

### Development
`BOT_TOKEN=... IS_WEBHOOK_DISABLED=... docker-compose -f development.docker-compose.yml up --build`

### Production
#### Docker Compose
`BOT_TOKEN=... RABBIT_URL=... SENTRY_DSN=... POSTGRES_URL=... docker-compose -f production.docker-compose.yml up -d`

#### Docker Swarm
`BOT_TOKEN=... RABBIT_URL=... SENTRY_DSN=... POSTGRES_URL=... WEBHOOK_HOST=... WEBHOOK_PORT=... WEBHOOK_PATH=... docker stack deploy -c production.docker-swarm.yml face_fucker_bot`

##### Webhook info
Telegram can't use subdomain like `example.example.com`, so you need to use something like `example.com/bots/...` for your webhook.

Also if you using https for this domain, you need to pass `443` port for `WEBHOOK_PORT` env variable, so telegram api and traefik work together.
