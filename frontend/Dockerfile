FROM node:18-alpine

WORKDIR /app

ARG PROFILE=dev
ENV PROFILE=${PROFILE}

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

EXPOSE 3000

# Development: hot reload on port 3000
CMD if [ "$PROFILE" = "dev" ] ; then \
      npm run dev ; \
    else \
      npm run build && npm start ; \
    fi
