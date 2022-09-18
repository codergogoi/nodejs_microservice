FROM node

WORKDIR /app/products

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8002

CMD ["npm", "start"]