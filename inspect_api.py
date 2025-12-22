from gradio_client import Client

# Connect to the IDM-VTON API
client = Client("yisol/IDM-VTON")

# View the API information
print("=" * 60)
print("IDM-VTON API Information")
print("=" * 60)
print("\nAvailable endpoints:")
print(client.view_api())
