import requests
import os

BACKGROUND_DIR = "backgrounds"
os.makedirs(BACKGROUND_DIR, exist_ok=True)

# Sample background images
backgrounds = [
    ("https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80", "gradient_bg.jpg"),
    ("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80", "abstract_bg.jpg"),
    ("https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80", "studio_bg.jpg"),
]

def download_file(url, filename):
    path = os.path.join(BACKGROUND_DIR, filename)
    if os.path.exists(path):
        print(f"{filename} already exists.")
        return
    
    print(f"Downloading {filename}...")
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")

if __name__ == "__main__":
    for url, filename in backgrounds:
        download_file(url, filename)
    print("Background download complete. Check the 'backgrounds' folder.")
