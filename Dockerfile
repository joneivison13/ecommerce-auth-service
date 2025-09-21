# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package.json yarn.lock ./

# Install the dependencies
RUN yarn

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code
RUN yarn build

RUN npx prisma migrate deploy

# Expose the port on which the API will run
EXPOSE 4090

# Start the API
CMD ["yarn", "start"]