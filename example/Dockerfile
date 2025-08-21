# ---------- Builder Stage ----------
FROM node:20-slim AS builder

# Create a temporary, clean workdir for a fresh install
WORKDIR /tmp/build-deps

# Install pnpm globally
RUN npm install -g pnpm

# Copy only pnpm-related files for initial dependency installation
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY example/pnpm-lock.yaml ./example/
COPY example/package.json ./example/

# Force a fresh install of all dependencies
# This step ensures the correct native modules are fetched
RUN pnpm install

# Now, create the final workdir for the build
WORKDIR /app

# Copy the entire project into the app directory
COPY . .

# Copy the node_modules from the temporary directory to the final app directory
RUN cp -a /tmp/build-deps/node_modules /app/node_modules

# Build the SDK/outer module first
RUN pnpm build

# Move into the example app directory
WORKDIR /app/example

# Install example dependencies, which will link to the built SDK
RUN pnpm install

# Build the example app
RUN pnpm build


# ---------- Runtime Stage ----------
FROM nginx:alpine

# Copy built example app into nginx html folder
COPY --from=builder /app/example/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]