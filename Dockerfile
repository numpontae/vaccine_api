FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . ./
RUN apk add python make gcc g++
RUN npm install

RUN npm install pm2 -g

RUN npm run build

EXPOSE 30020
CMD ["pm2-runtime", "start", "dist/app.js", "--instances", "max"]
