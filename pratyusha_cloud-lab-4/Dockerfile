FROM node:12

WORKDIR /usr/app-src
COPY package*.json ./

RUN npm install 

COPY . .

RUN echo "Creating a Docker immage by thamminenip1@udayton.edu"

CMD ["npm","start"]