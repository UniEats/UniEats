# Stage 1: Create html/css/js files from the code
FROM node:22 AS build
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci --omit=dev
RUN npm install axios @types/axios
COPY . .
RUN npm run build

# Stage 2: Use nginx to serve html/css/js files for browsers to run
FROM nginx:1.27.4 AS deploy
WORKDIR /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY run.sh /
COPY --from=build /app/dist/ .
# Read env vars before handing control to nginx (Which does not read env vars)
CMD ["sh", "/run.sh"]