FROM node:20

WORKDIR /app

COPY package.json ./

COPY backend ./backend
COPY ecosystem ./ecosystem
COPY models ./models
COPY packages ./packages
COPY public ./public
COPY seeders ./seeders
COPY src ./src
COPY template ./template
COPY themes ./themes
COPY types ./types
COPY . .

RUN apt-get update && apt-get install -y \
    git \
    curl \
    bash \
    dos2unix \
    build-essential \
    python3 \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2

ENV CI=true

RUN npm install -g pnpm && pnpm install

RUN pnpm build:all

EXPOSE 3000 4000

CMD ["pnpm", "start"]
