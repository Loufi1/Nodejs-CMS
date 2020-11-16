FROM node:14.15.0

WORKDIR /app

COPY package.json package.json

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start" ]
