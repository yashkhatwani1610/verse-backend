from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Import your existing routes
from api_server import *

# Vercel serverless function handler
def handler(event, context):
    return app(event, context)
