# Verse Virtual Try-On Project

Experience your style in a new dimension with **Verse Virtual Try-On** - powered by state-of-the-art AI technology.

## ✨ Features

- **🎯 Real-time Virtual Try-On**: Upload a person's image and a garment to see instant results
- **🎬 Video Generation**: Create 3-5 second videos with smooth zoom effects
- **🎨 Custom Backgrounds**: Choose from our gallery or upload your own backgrounds
- **👕 Garment Gallery**: Pre-load your brand's collection for easy selection
- **🚀 Robust Backend**: Powered by the IDM-VTON diffusion model
- **💻 Simple Interface**: Beautiful, easy-to-use Gradio web interface

## 📋 Prerequisites

- **Python 3.9 - 3.12** (Python 3.13+ is NOT supported due to dependency limitations)
- Internet connection (for API access)

> **⚠️ Important**: If you're running Python 3.13 or higher, you'll encounter dependency errors. See the installation steps below for the solution.

## 🔧 Installation

### Quick Start (Recommended)

1.  **Ensure you have Python 3.11 installed**:
    ```bash
    # Check if Python 3.11 is available
    python3.11 --version
    
    # If not installed, install via Homebrew (macOS)
    brew install python@3.11
    ```

2.  **Create and activate a virtual environment**:
    ```bash
    # Create virtual environment with Python 3.11
    python3.11 -m venv venv
    
    # Activate the virtual environment
    source venv/bin/activate
    
    # Verify Python version (should show 3.11.x)
    python --version
    ```

3.  **Install dependencies**:
    ```bash
    pip install --upgrade pip
    pip install -r requirements.txt
    ```

4.  **Download sample backgrounds** (optional):
    ```bash
    python download_backgrounds.py
    ```

### Alternative: Using the Run Script

We've provided a convenient script that handles everything for you:

```bash
# Make the script executable (first time only)
chmod +x run.sh

# Run the application
./run.sh
```

## 🚀 Usage

1.  **Add Your Garments**:
    - Place your clothing images (JPG/PNG) in the `garments/` folder
    - They will automatically appear in the "Collection" tab

2.  **Add Custom Backgrounds** (Optional):
    - Place background images in the `backgrounds/` folder
    - They will appear in the "Background Gallery" tab

3.  **Run the Application**:
    ```bash
    # Activate virtual environment (if not already activated)
    source venv/bin/activate
    
    # Run the app
    python app.py
    
    # Or use the convenience script
    ./run.sh
    ```
    This will launch:
    - Local server at `http://127.0.0.1:7860`
    - Public shareable link (e.g., `https://xxxx.gradio.live`)

4.  **Using the App**:
    - Upload or capture your photo
    - Select a garment from the collection or upload one
    - (Optional) Choose a custom background
    - (Optional) Enable video generation
    - Click "Try On Now" and wait for the magic! ✨

## 🌐 Website Integration

Check out `integration_demo.html` for examples of how to embed Verse Virtual Try-On into your brand's website:
- **Method 1**: Simple iframe embedding
- **Method 2**: Custom integration using `@gradio/client` JavaScript library

## ⚡ Performance Note

The underlying AI model (IDM-VTON) is a diffusion model that generates photorealistic results. Processing typically takes 5-15 seconds per image. This is the trade-off for high-quality, realistic virtual try-on results.

## 📁 Project Structure

```
├── app.py                      # Main Gradio application
├── garments/                   # Your clothing collection
├── backgrounds/                # Custom background images
├── outputs/                    # Generated videos and images
├── download_data.py           # Download sample person images
├── download_backgrounds.py    # Download sample backgrounds
├── integration_demo.html      # Website integration examples
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## 🎨 Customization

### Branding
The app is branded as "Verse Virtual Try-On" with a purple gradient theme. You can customize the branding in `app.py` by modifying:
- The CSS in the `custom_css` variable
- The HTML header content
- Color schemes and styling

### Adding More Features
- Add more background options to the `backgrounds/` folder
- Customize video duration and effects in the `create_video_from_image()` function
- Adjust the try-on parameters (denoise_steps, seed) for different results

## 📝 License

This project uses the IDM-VTON model via Hugging Face Spaces API. Please review their terms of service for commercial usage.

---

**Verse Virtual Try-On** - *Experience Your Style in a New Dimension* 🌟
