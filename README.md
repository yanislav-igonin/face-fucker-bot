# Face Fucker Bot

## Try out
[Deployed bot](https://t.me/face_fucker_bot)

## Startup
### Development
Start rabbit and postgresql via docker:
```bash
docker-compose -f development.docker-compose.yml up --build
```
Start app:
```bash
npm run start:dev
```

### Production
```bash
BOT_TOKEN=... RABBIT_URL=... SENTRY_DSN=... POSTGRES_URL=... WEBHOOK_HOST=... WEBHOOK_PORT=... WEBHOOK_PATH=... docker stack deploy -c production.docker-swarm.yml face-fucker-bot
```

### Webhook info
Telegram can't use subdomain like `example.example.com`, so you need to use something like `example.com/bots/...` for your webhook.

Also if you using https for this domain, you need to pass `443` port for `WEBHOOK_PORT` env variable, so telegram api and traefik work together.
