from gradio_client import Client, handle_file
import os

def test_rmbg():
    try:
        client = Client("multimodalart/remove-background")
        print("Successfully connected to multimodalart/remove-background")
        return True
    except Exception as e:
        print(f"Failed to connect to RMBG: {e}")
        return False

if __name__ == "__main__":
    test_rmbg()
