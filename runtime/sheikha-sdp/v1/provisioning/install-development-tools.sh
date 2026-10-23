#!/bin/sh
set -eu
sudo apt-get install --no-install-recommends cmake ninja-build clang
cmake --version
ninja --version
clang --version
