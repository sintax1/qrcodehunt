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

# Allow node to write to images folder
RUN chmod -R 777 /home/node/app/images

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Add the wait script to wait for mongo service to be available
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

# Run the app when the container launches
# CMD ["npm", "start"]
CMD ["/wait", "&&", "npm", "start"]