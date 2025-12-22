# Python Version Compatibility Fix

## Problem
You're running Python 3.14.0, but the dependencies for this Virtual Try-On project require Python 3.9-3.12.

The error occurs because `inference-sdk` (a dependency of one of your packages) doesn't support Python 3.13+.

## Solution: Install Python 3.11

### Step 1: Install Python 3.11 using Homebrew
```bash
brew install python@3.11
```

### Step 2: Create a Virtual Environment with Python 3.11
```bash
# Navigate to your project directory
cd "/Users/yashkhatwani/Documents/Virtual try on project "

# Create virtual environment with Python 3.11
python3.11 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Verify Python version (should show 3.11.x)
python --version
```

### Step 3: Install Dependencies
```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

### Step 4: Run Your Application
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run the app
python app.py
```

## Alternative: Use pyenv for Python Version Management

If you want better Python version management:

```bash
# Install pyenv
brew install pyenv

# Install Python 3.11
pyenv install 3.11.7

# Set Python 3.11 for this project
cd "/Users/yashkhatwani/Documents/Virtual try on project "
pyenv local 3.11.7

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Quick Check: Which Python versions are installed?
```bash
# List all Python versions
ls -la /usr/local/bin/python*
```

## Notes
- Always activate the virtual environment before running the app: `source venv/bin/activate`
- To deactivate: `deactivate`
- The virtual environment folder (`venv/`) should be added to `.gitignore`
