# 1. Build
FROM node:22-alpine AS build
WORKDIR /app

# Set build arg for API URL (empty for Docker networking)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .

# Show what VITE_API_URL is set to during build
RUN echo "Building with VITE_API_URL=${VITE_API_URL}"

RUN npm run build

# 2. Run with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
