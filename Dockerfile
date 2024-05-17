FROM node:20.12.2

WORKDIR /app
COPY ./dist/index.js /app
EXPOSE 9999
CMD ["node", "index.js"]