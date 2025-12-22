import requests
import os

GARMENT_DIR = "garments"
os.makedirs(GARMENT_DIR, exist_ok=True)

# Sample garment images from Unsplash
GARMENTS = [
    {
        "url": "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
        "filename": "tshirt_white.jpg"
    },
    {
        "url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        "filename": "tshirt_black.jpg"
    },
    {
        "url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
        "filename": "hoodie_gray.jpg"
    },
    {
        "url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
        "filename": "dress_floral.jpg"
    },
    {
        "url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
        "filename": "jacket_denim.jpg"
    }
]

def download_file(url, filename):
    path = os.path.join(GARMENT_DIR, filename)
    if os.path.exists(path):
        print(f"✓ {filename} already exists.")
        return True
    
    print(f"⬇️  Downloading {filename}...")
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"✅ Downloaded {filename}")
        return True
    except Exception as e:
        print(f"❌ Failed to download {filename}: {e}")
        return False

if __name__ == "__main__":
    print("🎨 Downloading sample garments for Verse Virtual Try-On...")
    print(f"📁 Target directory: {GARMENT_DIR}/\n")
    
    success_count = 0
    for garment in GARMENTS:
        if download_file(garment["url"], garment["filename"]):
            success_count += 1
    
    print(f"\n✨ Download complete! {success_count}/{len(GARMENTS)} garments ready.")
    print(f"📂 Check the '{GARMENT_DIR}' folder for your garment collection.")
    print("🔄 Restart the app to see the new garments!")
