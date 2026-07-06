#!/usr/bin/env bash

echo "===== STORAGE ====="
df -h /

echo
echo "===== TOP CONFIG ====="
du -sh ~/.config/* 2>/dev/null | sort -hr | head -20

echo
echo "===== TOP CACHE ====="
du -sh ~/.cache/* 2>/dev/null | sort -hr | head -20

echo
echo "===== OLLAMA ====="
du -sh ~/.ollama

echo
echo "===== VSCODE ====="
du -sh ~/.vscode
