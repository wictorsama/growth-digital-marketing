# Use imagem oficial do Node.js
FROM node:18

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Instala o NestJS CLI globalmente (opcional)
RUN npm install -g @nestjs/cli

# Copia todos os arquivos do projeto (inclusive tsconfig.json, src/, etc.)
# Localhost ***********
COPY . .
# Dockerfile ***********
# COPY ./src/data/phone_data.csv ./
# Gera os arquivos compilados TypeScript em /dist
RUN npm run build

# Expõe a porta da aplicação
EXPOSE 3000

# Comando de start para produção
CMD ["npm", "run", "start:prod"]
