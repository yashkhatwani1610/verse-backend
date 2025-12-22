# Verse Virtual Try-On - Integrated Website

Experience your style in a new dimension with **Verse Virtual Try-On** - now fully integrated with your Lovable website!

## 🎉 What's New

This integrated version combines:
- ✨ **Beautiful React Website** - Modern, responsive design matching your Lovable code
- 🎯 **Virtual Try-On Feature** - AI-powered garment visualization
- 🛍️ **Product Catalog** - Shopify integration for your products
- 🎬 **Video Generation** - Create dynamic 3-5 second try-on videos

## 📋 Prerequisites

- **Python 3.9 - 3.12** (Python 3.13+ is NOT supported)
- **Node.js 16+** and npm
- Internet connection (for API access)

## 🚀 Quick Start

### 1. Set Up Python Backend

```bash
# Create and activate virtual environment with Python 3.11
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Set Up React Frontend

```bash
# Navigate to website directory
cd website

# Install dependencies
npm install
```

### 3. Start the Application

**Option A: Use the startup script (Recommended)**
```bash
# Make the script executable
chmod +x start_integrated.sh

# Run the script
./start_integrated.sh
```

**Option B: Start servers manually**

Terminal 1 - Python API Server:
```bash
source venv/bin/activate
python api_server.py
```

Terminal 2 - React Frontend:
```bash
cd website
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:7860

## 📁 Project Structure

```
├── api_server.py              # Flask API server for virtual try-on
├── app.py                     # Original Gradio interface (still available)
├── website/                   # React frontend application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx      # Home page
│   │   │   ├── Products.tsx   # Products listing
│   │   │   └── VirtualTryOn.tsx # Virtual try-on page
│   │   ├── components/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ui/
│   │   │       └── button.tsx
│   │   └── lib/
│   │       └── shopify.ts     # Shopify integration
│   └── package.json
├── garments/                  # Your clothing collection
├── backgrounds/               # Custom background images
├── outputs/                   # Generated results
└── requirements.txt           # Python dependencies
```

## 🎨 Features

### Home Page
- Split hero banner with signature collection
- Featured products from Shopify
- Brand philosophy section
- Responsive design

### Products Page
- Grid view of all products
- Product filtering and search (coming soon)
- Direct links to product details

### Virtual Try-On Page
- Upload your photo via webcam or file
- Select from your Shopify product catalog
- Upload custom garments
- Generate static images or videos
- Real-time processing status

## 🔧 Configuration

### Shopify Integration

The current implementation uses mock products. To connect to your actual Shopify store:

1. Get your Shopify Storefront API credentials
2. Update `website/src/lib/shopify.ts` with your store details
3. Replace the mock `fetchProducts` function with actual API calls

Example:
```typescript
const SHOPIFY_STORE = 'your-store.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = 'your-token';
```

### Customization

**Branding**: Update colors and styles in:
- `website/src/index.css` - Global styles
- Component files - Individual component styles

**Products**: Add product images to `garments/` folder for the virtual try-on gallery

**Backgrounds**: Add custom backgrounds to `backgrounds/` folder

## 🌐 Sharing Your Website
To share your website with others (outside your local computer), please refer to the **[Sharing Guide](file:///Users/yashkhatwani/.gemini/antigravity/brain/a00d3660-0870-47d5-a64e-abef6d68c6c6/SHARING_GUIDE.md)**.

It covers:
- Quick sharing with **ngrok**
- Local network sharing
- Permanent deployment options

## 🌐 Deployment

### Frontend (Vercel/Netlify)
```bash
cd website
npm run build
# Deploy the 'dist' folder
```

### Backend (Heroku/Railway/DigitalOcean)
- Deploy `api_server.py` as a Python Flask application
- Update the API endpoint in `website/src/pages/VirtualTryOn.tsx`
- Set environment variables for production

## 🐛 Troubleshooting

**API Connection Error**
- Ensure the Python API server is running on port 7860
- Check CORS settings in `api_server.py`
- Verify the API URL in `VirtualTryOn.tsx`

**Virtual Try-On Not Working**
- Check that you have internet connection (for IDM-VTON API)
- Verify Python dependencies are installed
- Check the API server logs for errors

**Products Not Loading**
- Update the Shopify integration in `lib/shopify.ts`
- Check that mock products are properly configured

## 📝 Development

**Run in Development Mode**
```bash
# Terminal 1: API Server with auto-reload
source venv/bin/activate
python api_server.py

# Terminal 2: React with hot-reload
cd website
npm run dev
```

**Build for Production**
```bash
cd website
npm run build
```

## 🎯 Next Steps

- [ ] Connect to real Shopify Storefront API
- [ ] Add user authentication
- [ ] Implement product detail pages
- [ ] Add shopping cart functionality
- [ ] Deploy to production

## 📄 License

This project uses the IDM-VTON model via Hugging Face Spaces API. Please review their terms of service for commercial usage.

---

**Verse Virtual Try-On** - *Experience Your Style in a New Dimension* 🌟
