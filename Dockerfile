# Use the exact Python version you were using locally
FROM python:3.11-slim

# Set the working directory inside the cloud computer
WORKDIR /app

# Copy your perfect, minimal requirements file
COPY requirements.txt .

# Install the packages 
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Hugging Face REQUIRES your app to run on port 7860
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]