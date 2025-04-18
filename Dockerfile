FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV SESSION_SECRET=bilan_competences_docker_secret

EXPOSE 3000

CMD ["npm", "start"]
