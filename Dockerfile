FROM node:14

RUN mkdir /app

WORKDIR /app

COPY package* ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]
