# 1. Build
FROM node:22-alpine AS build
WORKDIR /app

# Set build args for Vite (empty defaults)
ARG VITE_API_URL=
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm install
COPY . .

# Show what Vite envs are set to during build
RUN echo "Building with VITE_API_URL=${VITE_API_URL}" \
	&& echo "Building with VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}"

RUN npm run build

# 2. Run with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
