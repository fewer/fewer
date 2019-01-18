FROM node:10

VOLUME ["/app"]
WORKDIR /app

RUN yarn
EXPOSE 8080
