FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Prevents Python from writing .pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install uv
RUN pip install --no-cache-dir uv

# Copy dependency files and install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --dev

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 8000

CMD ["uv", "run", "python", "app.py"]
