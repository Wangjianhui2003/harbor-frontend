# harbor-frontend

The frontend of HarborIM

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chromium
pnpm test:e2e --project=chromium
# Runs the tests of a specific file
pnpm test:e2e tests/example.spec.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

## Docker Deployment

Build the image:

```sh
docker build -t harbor-frontend .
```

Run the container (with HTTP/3 support):

```sh
docker run -d \
  --name harbor-frontend \
  --restart always \
  -p 80:80 \
  -p 443:443/tcp \
  -p 443:443/udp \
  --network harbor \
  -v /etc/letsencrypt/live/www.jianhui03.cn/fullchain.pem:/etc/letsencrypt/live/www.jianhui03.cn/fullchain.pem:ro \
  -v /etc/letsencrypt/live/www.jianhui03.cn/privkey.pem:/etc/letsencrypt/live/www.jianhui03.cn/privkey.pem:ro \
  harbor-frontend
```

> **Note:**
> - HTTP/3 (QUIC) requires the **UDP** port 443 to be exposed (`-p 443:443/udp`).
> - Replace `/etc/letsencrypt/live/www.jianhui03.cn/fullchain.pem` and `/etc/letsencrypt/live/www.jianhui03.cn/privkey.pem` with the absolute paths to your SSL certificate and private key on the host machine.
