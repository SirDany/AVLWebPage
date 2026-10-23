FROM node:24.22.1-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN PAYLOAD_SECRET=build-only-placeholder-never-use-in-production DATABASE_URL=file:./build.db DATABASE_PUSH=false npm run build
RUN npm prune --omit=dev

FROM node:24.22.1-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/scripts ./scripts
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json /app/tsconfig.json /app/next.config.mjs ./
RUN mkdir -p /app/media && chown node:node /app/media
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && npm start"]
