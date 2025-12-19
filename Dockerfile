# ===========================================
# Srisin Family Website - Dockerfile
# Flask app with admin panel and static site
# ===========================================

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY admin_server.py .
COPY index.html .
COPY css/ ./css/
COPY js/ ./js/
COPY templates/ ./templates/

# Create directories for persistent storage and data
RUN mkdir -p ./videos ./assets ./uploads ./data

# Create health check file
RUN echo "OK" > /app/health.txt

# Set environment variables
ENV FLASK_APP=admin_server.py
ENV HOST=0.0.0.0
ENV PORT=80

# Expose port 80
EXPOSE 80

# Start Flask app
CMD ["python", "admin_server.py"]
