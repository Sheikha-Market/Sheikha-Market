#!/bin/bash
# Script: auto-ollama-sheikha-core.sh
# Purpose: Ensure Ollama server and Sheikha-Core model are always running

OLLAMA_PORT=11434
OLLAMA_HOST=127.0.0.1
MODEL_NAME="Sheikha-Core"
MODEL_FILE="models/sheikha-core/Modelfile"

# Check if Ollama server is running
if ! lsof -i :$OLLAMA_PORT | grep LISTEN >/dev/null; then
  echo "[Sheikha] Ollama server not running. Starting..."
  nohup ollama serve > /dev/null 2>&1 &
  sleep 3
else
  echo "[Sheikha] Ollama server already running."
fi

# Check if model exists
if ! ollama list | grep -q "$MODEL_NAME"; then
  echo "[Sheikha] Model $MODEL_NAME not found. Creating..."
  ollama create "$MODEL_NAME" -f "$MODEL_FILE"
else
  echo "[Sheikha] Model $MODEL_NAME already exists."
fi

# Run the model if not running
if ! pgrep -f "ollama run $MODEL_NAME" >/dev/null; then
  echo "[Sheikha] Running $MODEL_NAME..."
  nohup ollama run "$MODEL_NAME" > /dev/null 2>&1 &
else
  echo "[Sheikha] $MODEL_NAME is already running."
fi
