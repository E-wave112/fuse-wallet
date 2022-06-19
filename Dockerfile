FROM node:16-alpine3.15 as dev

WORKDIR /usr/src/app,

COPY tsconfig*.json ./

COPY package*.json ./

RUN npm install

ENV NODE_ENV=development
ENV PORT=8000

# EXPOSE the port
EXPOSE $PORT


COPY . .

CMD ["npm","run","start:dev"]