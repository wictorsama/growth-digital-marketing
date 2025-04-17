# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install NestJS CLI globally (optional)
RUN npm install -g @nestjs/cli

# Copy all project files (including tsconfig.json, src/, etc.)
# Localhost ***********
COPY . .
# Dockerfile ***********
# COPY ./src/data/phone_data.csv ./

# Build the TypeScript files into /dist
RUN npm run build

# Expose the application port
EXPOSE 3000

# Production start command
CMD ["npm", "run", "start:prod"]
