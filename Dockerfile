# Build local monorepo image
# docker build --no-cache -t  fastflow .

# Run image
# docker run -d -p 3000:3000 fastflow

FROM node:20-alpine
RUN apk add --update libc6-compat python3 make g++
# needed for pdfjs-dist
RUN apk add --no-cache build-base cairo-dev pango-dev

# Install Chromium
RUN apk add --no-cache chromium

# Install curl for container-level health checks
# Fixes: https://github.com/FastflowAI/Fastflow/issues/4126
RUN apk add --no-cache curl

#install PNPM globaly
# RUN npm install -g pnpm
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-timeout 300000 && \
    npm config set fetch-retries 5 && \
    npm install -g pnpm || (cat /root/.npm/_logs/*-debug-0.log && exit 1)

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV NODE_OPTIONS=--max-old-space-size=8192

WORKDIR /usr/src

# Copy app source
COPY . .

RUN pnpm install

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start" ]
