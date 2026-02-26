#!/bin/bash
export PATH="$HOME/.nvm/versions/node/v20.20.0/bin:$PATH"
exec node "$(dirname "$0")/sheikha-mcp-server.js"
