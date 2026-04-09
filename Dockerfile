# =============================================================
# Stage 1: Build
# =============================================================
FROM node:20-alpine AS build
WORKDIR /app

# Receber URL da API como build arg (definida no docker-compose)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Instalar dependências primeiro (camada cacheada enquanto package.json não mudar)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copiar código-fonte e build
COPY . .
RUN npm run build

# =============================================================
# Stage 2: Runtime — Nginx para SPA
# =============================================================
FROM nginx:1.25-alpine AS runtime

# Remover configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Configuração SPA: redireciona rotas do React para index.html
RUN printf 'server {\n\
    listen 80;\n\
    listen [::]:80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Suporte a React Router (SPA)\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Cache de assets com hash no nome (gerados pelo Vite)\n\
    location ~* \\.(?:js|css|woff2?|ttf|eot|svg|ico|png|jpg|jpeg|gif|webp)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
        access_log off;\n\
    }\n\
\n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript application/json;\n\
}\n' > /etc/nginx/conf.d/spa.conf

# Copiar os arquivos buildados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
