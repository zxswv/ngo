FROM node:20

WORKDIR /ngo

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3100

#起動プロトコル
CMD ["npm","run", "dev" ]
