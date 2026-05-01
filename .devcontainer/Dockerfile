FROM mcr.microsoft.com/devcontainers/javascript-node:24

RUN npm install -g npm@latest

WORKDIR /workspace

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080 9229

CMD ["npm", "run", "dev"]
