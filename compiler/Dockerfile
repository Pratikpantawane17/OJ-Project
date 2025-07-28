# # Steps : 
# # A) Create a Docker File :   
# # 1) Created a working directory and copied the code inside it (Similar to forking a GitHub Repo)
# # 2) Install the dependencies
# # 3) For exchange of the data between the docker container and the local system or machine or vice versa we need to "EXPOSE" it  
# # 4) Write the command by which Project will be run... --> 
#         # CMD ["node", "index.js"]
#         # OR 
#         # ENTRYPOINT ["node", "index.js"]
#         # FOR other command like : npm run dev --> 
#         # CMD ["npm", "run", "dev"]

# # B) Create Docker Image : docker build -t <name_of_image> <dockerfile_location> ->

# # C) Create an instance of Image (Docker container) :   
# # docker run -d 63637ddd6543 : -d is used so that it will allow to use the same terminal

# # Expose : To allow the data to be shared between the local and the docker

# # Specify the node version whose docker image you want...
# # "-alpine" is because it created the docker images of lesser size (light weight that normal FROM node:22)
# FROM node:22-alpine

# # Set the working directory in the container to /app
# WORKDIR /app 

# # Below line of code is used to install the compilers
# RUN apk update && apk add --no-cache g++ 

# # <local_path> : the path of folder whose code you want to copy 
# # <container_path> : in which directly Code will be copied
# # COPY <local_path> <container_path>
# COPY ./compiler /app
# COPY ./backend/models /app/backend/models
# COPY ./backend/database /app/backend/database
# COPY ./compiler/package.json /app
# COPY ./compiler/.env /app

# RUN npm install
# EXPOSE 8000
# CMD ["node", "index.js"]

# __________________________________________________________________________


# Use Node.js Alpine image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Install C++ (g++), Python (aliased as python), pip, and latest Java (openjdk21)
RUN apk update && apk add --no-cache \
    g++ \
    python3 \
    py3-pip \
    openjdk21 \
    && ln -sf python3 /usr/bin/python

# Copy your project files
COPY ./compiler /app
COPY ./backend/models /app/backend/models
COPY ./backend/database /app/backend/database
COPY ./compiler/package.json /app
COPY ./compiler/.env /app

# Install Node.js dependencies
RUN npm install

# Expose the port
EXPOSE 8000

# Start the Node.js app
CMD ["node", "index.js"]




