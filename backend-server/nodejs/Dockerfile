# Use a lighter version of Node as a parent image
FROM node

# Set the working directory
WORKDIR /home/node/app

# copy package.json into the container
COPY package*.json /home/node/app/

# install dependencies
RUN npm install

# Copy the current directory contents into the container
COPY . /home/node/app/

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the app when the container launches
CMD ["npm", "start"]