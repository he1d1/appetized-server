FROM node:latest

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

EXPOSE 3000
CMD ["cross-env", "NODE_ENV=production", "ts-node", "src/app.ts"]
