FROM node:8
# Create app directory
RUN mkdir -p /user/src/app

WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./

RUN npm install
# Copy app source code
COPY . .
#Expose port and start application
EXPOSE 8080

CMD [ "npm", "start" ]