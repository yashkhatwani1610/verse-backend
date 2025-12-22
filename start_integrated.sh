#!/bin/bash

# Verse Virtual Try-On - Integrated Application Startup Script

echo "🚀 Starting Verse Virtual Try-On Application..."
echo ""

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first:"
    echo "   python3.11 -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating Python virtual environment..."
source venv/bin/activate

# Check if node_modules exists in website directory
if [ ! -d "website/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd website
    npm install
    cd ..
fi

# Start the Python API server in the background
echo "🐍 Starting Python API server on port 7860..."
python api_server.py &
API_PID=$!

# Wait a bit for the API server to start
sleep 3

# Start the React frontend
echo "⚛️  Starting React frontend..."
cd website
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 API Server: http://localhost:7860"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $API_PID $FRONTEND_PID; exit" INT
wait
