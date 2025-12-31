# 1. BASIS: Wir starten mit einem minimalen Linux, auf dem Node 18 vorinstalliert ist
FROM node:18-alpine

# 2. ORT: Wir erstellen einen Ordner im Container, wo die App liegen soll
WORKDIR /app

# 3. CACHING-TRICK: Wir kopieren ZUERST nur die Paket-Listen
COPY package*.json ./

# 4. INSTALLATION: Wir installieren die Abhängigkeiten
# 'npm ci' ist wie 'npm install', aber schneller und exakter für Server (Clean Install)
RUN npm ci --only=production

# 5. CODE: Jetzt kopieren wir erst den restlichen Code (src, config, etc.)
# Da sich Code oft ändert, Dependencies aber selten, muss Docker Schritt 4 nicht jedes Mal neu machen
COPY . .

# 6. PORT: Wir dokumentieren, dass der Container auf Port 3000 hört
EXPOSE 3000

# 7. START: Der Befehl, der ausgeführt wird, wenn der Container startet
CMD ["npm", "start"]