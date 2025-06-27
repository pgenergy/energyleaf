# Use official Postgres 17 image
FROM postgres:17

#–– Build arguments (can be overridden at build-time) ––
ARG PG_NET_VERSION=0.14.0
ARG PG_CRON_VERSION=1.6.4

#–– 1) Install system dependencies ––
# combining update/install/cleanup in one layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      wget \
      curl \
      git \
      cmake \
      postgresql-server-dev-17 \
      ca-certificates \
      libcurl4-openssl-dev \
      build-essential && \
    rm -rf /var/lib/apt/lists/*

#–– 2) Fetch, build & install pg_net ––
RUN git clone --branch v${PG_NET_VERSION} \
      https://github.com/supabase/pg_net.git /tmp/pg_net && \
    cd /tmp/pg_net && \
    make && \
    make install && \
    rm -rf /tmp/pg_net

#–– 3) Fetch, build & install pgmq ––
RUN git clone \
      https://github.com/tembo-io/pgmq.git /tmp/pgmq && \
    cd /tmp/pgmq/pgmq-extension && \
    make && \
    make install && \
    rm -rf /tmp/pgmq

#–– 4) Fetch, build & install pg_cron ––
RUN git clone --branch v${PG_CRON_VERSION} \
      https://github.com/citusdata/pg_cron.git /tmp/pg_cron && \
    cd /tmp/pg_cron && \
    make && \
    make install && \
    export PATH=/usr/pgsql-17/bin:$PATH && \
    export PATH=/usr/pgsql-16/bin:$PATH && \
    rm -rf /tmp/pg_cron

#-- 5) Fetch, build & install timescaledb --
RUN git clone https://github.com/timescale/timescaledb && \
    cd timescaledb && \
    git checkout 2.17.2 && \
    ./bootstrap && \
    cd build && make && \
    make install

#–– 5) Enable extensions by default ––
RUN { \
      echo "shared_preload_libraries = 'pg_cron, pg_net, timescaledb'"; \
      echo "cron.database_name = 'energyleaf'"; \
      echo "pg_net.database_name = 'energyleaf'"; \
    } >> /usr/share/postgresql/postgresql.conf.sample

#–– Expose and default command ––
EXPOSE 5432
CMD ["postgres"]
