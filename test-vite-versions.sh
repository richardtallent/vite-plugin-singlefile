#!/bin/bash
set -e

VITE_VERSIONS=("5.4.11" "6.0.0" "7.0.0" "8.0.0")

echo "Testing against multiple Vite versions..."

for version in "${VITE_VERSIONS[@]}"; do
  echo ""
  echo "=========================================="
  echo "Testing with Vite $version..."
  echo "=========================================="
  npm install vite@"$version" --no-save --legacy-peer-deps
  npm test
  if [ $? -ne 0 ]; then
    echo "Tests failed for Vite $version"
    exit 1
  fi
done

echo ""
echo "=========================================="
echo "All tests passed for all Vite versions!"
echo "=========================================="
