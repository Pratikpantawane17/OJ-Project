# NOTE : We have passed the .env file while runnig the command and NOT copied directly because of which it will not be visible in /app Docker folder...but it will be working stil... 

# Use Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if present
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the backend port (change if your backend uses a different port)
EXPOSE 5000

# Start the backend
CMD ["node", "index.js"]