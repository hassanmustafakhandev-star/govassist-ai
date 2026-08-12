FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (including Tesseract OCR with Arabic support)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    tesseract-ocr \
    tesseract-ocr-ara \
    tesseract-ocr-eng \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (NOT .env — secrets come from HF Space Secrets)
COPY app/ ./app/

# Expose port 7860 (Hugging Face Spaces default port)
EXPOSE 7860

# Run Uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
