from gradio_client import Client, file
import shutil
import os

def test_connection():
    try:
        client = Client("yisol/IDM-VTON")
        print("Successfully connected to yisol/IDM-VTON")
        return True
    except Exception as e:
        print(f"Failed to connect: {e}")
        return False

if __name__ == "__main__":
    test_connection()
