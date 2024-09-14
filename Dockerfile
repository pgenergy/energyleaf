FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN npm --force install pnpm turbo --global

# RUN apk update
# RUN apk add --no-cache libc6-compat

# # Setup pnpm and turbo on the node base
# FROM node as base

# RUN pnpm config set store-dir ~/.pnpm-store

ARG HASH_SECRET=secret
ENV HASH_SECRET=${HASH_SECRET}
ARG ML_API_URL=0.0.0.0:8000
ENV ML_API_URL=${ML_API_URL}
ARG ML_API_KEY=secret_ml
ENV ML_API_KEY=${ML_API_KEY}
ARG PG_CONNECTION=postgresql://postgres:secret@0.0.0.0:5432/postgres
ENV PG_CONNECTION=${PG_CONNECTION}
ARG PG_DIRECT=postgresql://postgres:secret@0.0.0.0:5432/postgres
ENV PG_DIRECT=${PG_DIRECT}
ARG NEXT_PUBLIC_APP_URL=http://localhost:8000
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ARG NEXT_PUBLIC_ADMIN_URL=http://localhost:8001
ENV NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL}
ARG CRON_SECRET=secret_cron
ENV CRON_SECRET=${CRON_SECRET}

FROM base AS build
COPY ./apps/ /usr/src/app/apps/
COPY ./packages/ /usr/src/app/packages/
COPY ./patches/ /usr/src/app/patches/
COPY package.json /usr/src/app/package.json
COPY turbo.json /usr/src/app/turbo.json
COPY tsconfig.json /usr/src/app/tsconfig.json
COPY pnpm-lock.yaml /usr/src/app/pnpm-lock.yaml
COPY pnpm-workspace.yaml /usr/src/app/pnpm-workspace.yaml
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm --filter=web --prod deploy /prod/web
RUN pnpm --filter=admin --prod deploy /prod/admin
RUN pnpm --filter=@energyleaf/postgres deploy /prod/postgres

FROM base AS web
COPY --from=build /prod/web /prod/web
WORKDIR /prod/web
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS admin
COPY --from=build /prod/admin /prod/admin
WORKDIR /prod/admin
EXPOSE 3001
CMD [ "pnpm", "start" ]

FROM base AS db-migrate
COPY --from=build /prod/postgres /prod/postgres
WORKDIR /prod/postgres
CMD [ "pnpm", "migrate" ]