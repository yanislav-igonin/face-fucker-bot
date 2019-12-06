# Face Fucker Bot

## Startup

### Development
`BOT_TOKEN=... IS_WEBHOOK_DISABLED=... docker-compose -f development.docker-compose.yml up --build`

### Production
#### Docker Compose
`BOT_TOKEN=... RABBIT_URL=... SENTRY_DSN=... POSTGRES_URL=... IS_WEBHOOK_DISABLED=true docker-compose -f production.docker-compose.yml up -d`

#### Docker Swarm
`BOT_TOKEN=... RABBIT_URL=... SENTRY_DSN=... POSTGRES_URL=... WEBHOOK_URL=... WEBHOOK_PORT=... IS_WEBHOOK_DISABLED=false docker stack deploy -c production.docker-swarm.yml face_fucker_bot`