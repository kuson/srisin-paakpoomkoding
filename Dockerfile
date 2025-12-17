# ===========================================
# Srisin Family Website - Dockerfile
# Multi-stage build for optimized image size
# ===========================================

# Use nginx alpine for lightweight production image
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy website files
COPY index.html .
COPY css/ ./css/
COPY js/ ./js/
COPY videos/ ./videos/
COPY assets/ ./assets/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create health check file
RUN echo "OK" > /usr/share/nginx/html/health.txt

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
