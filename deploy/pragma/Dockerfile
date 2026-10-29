# syntax=docker/dockerfile:1.7
# Production image for the Pragma host (65.108.9.16). NEXT_PUBLIC_* values are
# inlined at build time: they are mounted as a build secret (NEXT_PUBLIC_*
# only) and never land in an image layer. Server secrets arrive at run time.
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=appenv,target=/run/secrets/appenv \
    set -a && . /run/secrets/appenv && set +a && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
