# Use an official Node.js runtime as a base image
FROM node:22.14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json before installing dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the Nuxt.js port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
