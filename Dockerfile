FROM node:26-trixie-slim

WORKDIR /app

# Installazione curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# -----------------------------
#  Bootstrap 5
# -----------------------------
RUN mkdir -p /app/public/bs/css && \
    mkdir -p /app/public/bs/js

RUN curl -L https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css \
         -o /app/public/bs/css/bootstrap.min.css && \
    curl -L https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js \
         -o /app/public/bs/js/bootstrap.bundle.min.js

# -----------------------------
#  Bootstrap Icons
# -----------------------------
RUN mkdir -p /app/public/bs-icons/fonts/

RUN curl -L https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css \
         -o /app/public/bs-icons/bootstrap-icons.min.css && \
    curl -L https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff2 \
         -o /app/public/bs-icons/fonts/bootstrap-icons.woff2 && \
    curl -L https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff \
         -o /app/public/bs-icons/fonts/bootstrap-icons.woff
         

# ------------------------------------
#  File .env generato automaticamente
# ------------------------------------
RUN echo "ADDRESS=\"0.0.0.0\"" > /app/.env && \
    echo "PORT=\'6568\'" >> /app/.env && \
    echo "SESSIONSS=\"$(head -c 32 /dev/urandom | base64)\"" >> /app/.env && \
    echo "GOOGLEAPIKEY=\"API_KEY\"" >> /app/.env

# ----------------------------------
#  Installazione dipendenze NodeJS
# ----------------------------------
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copia il resto del progetto
COPY . .

CMD ["npm", "start"]
