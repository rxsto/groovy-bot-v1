FROM node:10
EXPOSE 80
COPY /node_modules /node_modules
COPY /bot/json/config.json /bot/json/config.json
