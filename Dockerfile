FROM node:14-alpine

WORKDIR /fullstackfromlonghai/backend

COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm install -g @babel/core @babel/cli
# Copy the rest of the application code to the working directory
COPY . .

RUN npm run build-src

CMD [ "npm","run", "build"]

#docker build --tag node-docker .
# docker run -p 8080:8080 -d node-docker
