import requests
import os

DATA_DIR = "Data"
os.makedirs(DATA_DIR, exist_ok=True)

# Sample images
# Using some placeholder images from common datasets or reliable sources
# Person image (from Unsplash)
PERSON_URL = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=768&q=80"
# Garment image (from Unsplash - flat lay t-shirt)
GARMENT_URL = "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=768&q=80"

def download_file(url, filename):
    path = os.path.join(DATA_DIR, filename)
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
    download_file(PERSON_URL, "sample_person.jpg")
    download_file(GARMENT_URL, "sample_garment.jpg")
    print("Download complete. Check the 'Data' folder.")
