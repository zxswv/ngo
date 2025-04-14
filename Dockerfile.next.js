FROM node:20

WORKDIR /ngo

COPY package.json /ngo/

RUN npm install

COPY . /ngo/
#起動プロトコル
CMD ["npm","run", "dev" ]
