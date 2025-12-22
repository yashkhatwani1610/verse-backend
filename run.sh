#!/bin/bash

# Verse Virtual Try-On - Run Script
# This script activates the virtual environment and runs the application

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌟 Starting Verse Virtual Try-On...${NC}"

# Activate virtual environment
source venv/bin/activate

# Verify Python version
PYTHON_VERSION=$(python --version)
echo -e "${GREEN}✓ Using $PYTHON_VERSION${NC}"

# Run the application
echo -e "${BLUE}🚀 Launching Gradio app...${NC}"
python app.py
