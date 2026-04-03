FROM node:20-alpine AS base
ARG EnvFile
WORKDIR /app

ENV NX_DAEMON=false
ENV NX_DISABLE_DB=true
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm install

COPY /apps/page-builder/server.js ./server.js

FROM node:20-alpine AS builder
WORKDIR /app

# Apply memory limit during build phase
ENV NODE_OPTIONS=--max-old-space-size=3072

COPY . .
COPY --from=base /app/server.js ./server.js
COPY --from=base /app/node_modules ./node_modules

 
ENV NX_DISABLE_DB=true
RUN npx nx build page-builder --verbose

FROM node:20-alpine  AS runner

WORKDIR /app

COPY --from=builder /app/ ./
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules 

EXPOSE $PORT

CMD ["npm", "run", "run-image"]