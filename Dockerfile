FROM adoptopenjdk:8-jdk-hotspot-bionic

ARG REFRESHED_AT
ENV REFRESHED_AT $REFRESHED_AT

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -qq --no-install-recommends python2.7 make g++ gcc
RUN apt-get update -qq && apt-get install -qq --no-install-recommends \
  nodejs \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g npm
WORKDIR /usr/src/app

COPY . ./
RUN npm install

RUN npm install pm2 -g

RUN npm run build

EXPOSE 30010

CMD ["pm2-runtime", "start", "dist/app.js", "--instances", "2"]