# Face Fucker Bot

## Startup

### Development
`BOT_TOKEN=... docker-compose -f development.docker-compose.yml up --build`

### Production
#### Docker Compose
`BOT_TOKEN=... RABBIT_URL=... SENTRY_DSN=... POSTGRES_URL=... DISABLE_WEBHOOK=true docker-compose -f production.docker-compose.yml up -d`

#### Docker Swarm
`BOT_TOKEN=... RABBIT_URL=... SENTRY_DSN=... POSTGRES_URL=... WEBHOOK_URL=... WEBHOOK_PORT=... DISABLE_WEBHOOK=false docker stack deploy -c production.docker-swarm.yml face_fucker_bot`