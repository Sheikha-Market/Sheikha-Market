FROM mcr.microsoft.com/devcontainers/javascript-node:24

# ─── System packages ─────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv python3-dev \
    build-essential cmake pkg-config \
    libopenblas-dev liblapack-dev \
    libopencv-dev \
    git curl wget \
    && rm -rf /var/lib/apt/lists/*

# ─── Python venv ─────────────────────────────────────────────────
RUN python3 -m venv /workspace/.venv
ENV PATH="/workspace/.venv/bin:$PATH"
ENV VIRTUAL_ENV="/workspace/.venv"

# ─── Node.js ─────────────────────────────────────────────────────
RUN npm install -g npm@latest

WORKDIR /workspace

COPY package*.json ./
RUN npm install

# ─── Python packages ─────────────────────────────────────────────
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080 8000 8888 9229

CMD ["npm", "run", "dev"]
