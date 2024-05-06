FROM node:20.12.2

WORKDIR /app
COPY ./dist/index.js /app
EXPOSE 6969
CMD ["node", "index.js"]