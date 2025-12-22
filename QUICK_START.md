# 🚀 Virtual Try-On - Quick Start Guide

## ✅ Your Application is Now Running!

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:7860

## 📱 How to Use

1. **Open your browser** → `http://localhost:5173`
2. **Navigate to Virtual Try-On** page
3. **Upload your photo** (auto-cropping happens automatically)
4. **Select a garment** (from products or upload custom)
5. **Click "Try On Now"** ✨

## 🛑 How to Stop

Press `Ctrl+C` in the terminal where the script is running

## 🔄 How to Restart

If you need to restart:

```bash
# Stop all processes
pkill -f "start_integrated.sh"
lsof -ti:7860 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Start fresh
./start_integrated.sh
```

## ⚠️ Common Issues

### "Address already in use"
**Cause**: Script is already running or port is occupied

**Fix**:
```bash
# Kill processes on ports
lsof -ti:7860 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Restart
./start_integrated.sh
```

### "Backend not running" error in browser
**Fix**: Just refresh the browser (Cmd+R)

## 🎯 Features

✅ **Auto-Cropping** - Automatic person detection (no UI needed)  
✅ **AI Try-On** - Realistic garment fitting with IDM-VTON  
✅ **Video Generation** - Optional 3-5 second animation  
✅ **Shopify Integration** - Try on your store products  
✅ **Custom Uploads** - Upload any garment image

## 📝 Note

The auto-cropping feature is **backend-only**. When you upload a photo, the backend automatically:
- Detects faces using OpenCV
- Estimates body area
- Crops to show just the person
- No frontend interaction needed!

---

**Need more help?** Check the detailed guides in the `.gemini` folder.
