```
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from gradio_client import Client, handle_file
import os
from dotenv import load_dotenv
import razorpay
from PIL import Image, ImageFilter, ImageEnhance
import io
import base64
import cv2
import numpy as np
from datetime import datetime
import gemini_utils
from io import BytesIO
import hmac
import hashlib
from dotenv import load_dotenv
from gemini_utils import generate_size_recommendation, generate_style_advice, generate_tracking_update, call_gemini

# Load environment variables from .env file
load_dotenv()

# Razorpay Configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_live_RmFbFMzaZX1gjM")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "4Tpe6twOBSSZIRWPXhlZQMYk")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Set maximum file upload size to 50MB
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB in bytes

# Get Hugging Face token from environment
HF_TOKEN = os.getenv("HF_TOKEN", "").strip()

# Initialize the Gradio client with optional HF token and increased timeout
if HF_TOKEN:
    print("🔑 Using Hugging Face token for authentication")
    client = Client("yisol/IDM-VTON", hf_token=HF_TOKEN)
else:
    print("⚠️  No Hugging Face token found - using anonymous access (may have quota limits)")
    print("💡 To add a token, create a .env file with: HF_TOKEN=your_token_here")
    client = Client("yisol/IDM-VTON")

# Configure client with longer timeout (5 minutes for slow API responses)
import httpx
client.httpx_kwargs = {"timeout": httpx.Timeout(300.0, connect=60.0)}

GARMENT_DIR = "garments"
BACKGROUND_DIR = "backgrounds"
OUTPUT_DIR = "outputs"

for dir_path in [GARMENT_DIR, BACKGROUND_DIR, OUTPUT_DIR]:
    os.makedirs(dir_path, exist_ok=True)

for dir_path in [GARMENT_DIR, BACKGROUND_DIR, OUTPUT_DIR]:
    os.makedirs(dir_path, exist_ok=True)

def detect_and_crop_person(image_path):
    """
    Detect person in image and crop to show only the person.
    Uses OpenCV face detection and estimates body area.
    Returns path to cropped image, or original if no person detected.
    """
    try:
        import cv2
        
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            print("⚠️  Could not read image, using original")
            return image_path
        
        height, width = img.shape[:2]
        
        # Try face detection first (most reliable for person photos)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) > 0:
            # Found face(s) - use the largest one
            largest_face = max(faces, key=lambda f: f[2] * f[3])
            x, y, w, h = largest_face
            
            print(f"✅ Detected face at ({x}, {y}) with size {w}x{h}")
            
            # Expand crop to include full body
            # Assume body is ~3-4x face height, centered on face
            body_height = h * 4
            body_width = w * 2.5
            
            # Calculate crop coordinates
            center_x = x + w // 2
            center_y = y + h // 2
            
            crop_x1 = max(0, int(center_x - body_width // 2))
            crop_y1 = max(0, int(y - h * 0.5))  # Include some space above head
            crop_x2 = min(width, int(center_x + body_width // 2))
            crop_y2 = min(height, int(center_y + body_height // 2))
            
            # Crop image
            cropped = img[crop_y1:crop_y2, crop_x1:crop_x2]
            
            # Save cropped image
            base, ext = os.path.splitext(image_path)
            output_path = f"{base}_cropped{ext}"
            cv2.imwrite(output_path, cropped)
            
            print(f"✅ Cropped person image saved to: {output_path}")
            return output_path
        
        # No face detected - try full body detection
        print("⚠️  No face detected, trying full body detection...")
        body_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_fullbody.xml'
        )
        
        bodies = body_cascade.detectMultiScale(gray, 1.1, 3)
        
        if len(bodies) > 0:
            # Use largest detected body
            largest_body = max(bodies, key=lambda b: b[2] * b[3])
            x, y, w, h = largest_body
            
            print(f"✅ Detected body at ({x}, {y}) with size {w}x{h}")
            
            # Add padding
            padding = 20
            crop_x1 = max(0, x - padding)
            crop_y1 = max(0, y - padding)
            crop_x2 = min(width, x + w + padding)
            crop_y2 = min(height, y + h + padding)
            
            cropped = img[crop_y1:crop_y2, crop_x1:crop_x2]
            
            base, ext = os.path.splitext(image_path)
            output_path = f"{base}_cropped{ext}"
            cv2.imwrite(output_path, cropped)
            
            print(f"✅ Cropped body image saved to: {output_path}")
            return output_path
        
        # No person detected - return original image
        print("⚠️  No person detected, using original image")
        return image_path
        
    except Exception as e:
        print(f"❌ Error during person detection: {e}")
        import traceback
        traceback.print_exc()
        return image_path

def create_video_from_image(image_path, duration=4):
    """Create a short video with dynamic movements from a static image."""
    try:
        import imageio
        
        # Load the image
        img = Image.open(image_path)
        w, h = img.size
        
        # Create frames with multiple dynamic effects
        fps = 30
        total_frames = int(duration * fps)
        frames = []
        
        for i in range(total_frames):
            t = i / total_frames
            
            # Effect 1: Zoom (1.0 to 1.2)
            zoom = 1.0 + (t * 0.2)
            
            # Effect 2: Pan (subtle left-right movement)
            pan_x = int(20 * np.sin(t * 2 * np.pi))
            
            # Effect 3: Tilt (subtle up-down movement)
            tilt_y = int(15 * np.sin(t * 3 * np.pi))
            
            # Effect 4: Rotation (subtle rotation, max 3 degrees)
            rotation_angle = 3 * np.sin(t * 2 * np.pi)
            
            # Apply rotation first
            rotated = img.rotate(rotation_angle, resample=Image.Resampling.BICUBIC, expand=False)
            
            # Calculate crop box for zoom effect with pan and tilt
            new_w = int(w / zoom)
            new_h = int(h / zoom)
            left = (w - new_w) // 2 + pan_x
            top = (h - new_h) // 2 + tilt_y
            
            # Ensure crop box is within bounds
            left = max(0, min(left, w - new_w))
            top = max(0, min(top, h - new_h))
            
            # Crop and resize
            cropped = rotated.crop((left, top, left + new_w, top + new_h))
            zoomed = cropped.resize((w, h), Image.Resampling.LANCZOS)
            
            # Effect 5: Brightness variation for dynamic feel
            enhancer = ImageEnhance.Brightness(zoomed)
            enhanced = enhancer.enhance(1.0 + (t * 0.15))
            
            # Effect 6: Slight contrast boost
            contrast_enhancer = ImageEnhance.Contrast(enhanced)
            final_frame = contrast_enhancer.enhance(1.0 + (t * 0.1))
            
            frames.append(np.array(final_frame))
        
        # Save as video
        output_path = os.path.join(OUTPUT_DIR, f"tryon_video_{os.getpid()}.mp4")
        imageio.mimsave(output_path, frames, fps=fps, codec='libx264', quality=8)
        
        return output_path
    except Exception as e:
        print(f"Error creating video: {e}")
        import traceback
        traceback.print_exc()
        return None

@app.route('/api/tryon', methods=['POST'])
def tryon():
    """API endpoint for virtual try-on."""
    try:
        # Get uploaded files
        person_file = request.files.get('person_image')
        garment_file = request.files.get('garment_image')
        description = request.form.get('description', 'Stylish outfit')
        generate_video = request.form.get('generate_video', 'false').lower() == 'true'
        
        if not person_file or not garment_file:
            return jsonify({'error': 'Both person and garment images are required'}), 400
        
        # Save uploaded files temporarily
        person_path = os.path.join(OUTPUT_DIR, f'person_{os.getpid()}.jpg')
        garment_path = os.path.join(OUTPUT_DIR, f'garment_{os.getpid()}.jpg')
        
        person_file.save(person_path)
        garment_file.save(garment_path)
        
        # AUTO-CROP PERSON FROM IMAGE
        print("🔍 Detecting and cropping person from uploaded image...")
        cropped_person_path = detect_and_crop_person(person_path)
        
        # Prepare the person image dict for Gradio API
        person_image_dict = {
            "background": handle_file(cropped_person_path),
            "layers": [],
            "composite": None
        }
        
        # Call the IDM-VTON API
        try:
            result = client.predict(
                dict=person_image_dict,
                garm_img=handle_file(garment_path),
                garment_des=description,
                is_checked=True,
                is_checked_crop=True,  # Enable garment cropping for better fit
                denoise_steps=40,  # Maximum allowed value for best quality
                seed=42,
                api_name="/tryon"
            )
        except Exception as api_error:
            error_msg = str(api_error)
            print(f"❌ Hugging Face API Error: {error_msg}")
            
            # Check if it's a timeout error
            if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
                return jsonify({
                    'error': 'The AI model is taking longer than expected to respond.',
                    'details': 'The Hugging Face API is experiencing slow response times. This usually happens when the model is cold-starting or under heavy load.',
                    'suggestion': 'Please try again in a few moments. The model should be faster on subsequent requests.',
                    'tip': 'Adding a Hugging Face token may provide better reliability and priority access.'
                }), 504
            # Check if it's a quota/authentication error
            elif "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                return jsonify({
                    'error': 'API quota limit reached. Please add a Hugging Face token to your .env file.',
                    'details': 'Get a free token at https://huggingface.co/settings/tokens',
                    'instructions': 'Add HF_TOKEN=your_token to .env file and restart the server'
                }), 429
            elif "upstream" in error_msg.lower():
                return jsonify({
                    'error': 'The AI model is currently unavailable or overloaded. Please try again in a few moments.',
                    'details': error_msg,
                    'suggestion': 'Consider adding a Hugging Face token for better reliability'
                }), 503
            else:
                raise  # Re-raise if it's a different error
        
        result_image_path = result[0]
        
        # Convert result image to base64
        with open(result_image_path, 'rb') as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        response_data = {
            'image': f'data:image/png;base64,{image_base64}',
            'status': 'success'
        }
        
        # Generate video if requested
        if generate_video:
            video_path = create_video_from_image(result_image_path, duration=4)
            if video_path:
                with open(video_path, 'rb') as f:
                    video_data = f.read()
                    video_base64 = base64.b64encode(video_data).decode('utf-8')
                response_data['video'] = f'data:video/mp4;base64,{video_base64}'
        
        # Clean up temporary files
        try:
            os.remove(person_path)
            os.remove(garment_path)
        except:
            pass
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Error during try-on: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-order', methods=['POST'])
def create_order():
    """Create a Razorpay order."""
    try:
        data = request.json
        amount = data.get('amount')  # Amount in currency subunits (e.g., paise for INR)
        currency = data.get('currency', 'INR')
        
        if not amount:
            return jsonify({'error': 'Amount is required'}), 400
            
        order_data = {
            'amount': amount,
            'currency': currency,
            'payment_capture': 1  # Auto-capture payment
        }
        
        order = razorpay_client.order.create(data=order_data)
        return jsonify(order)
        
    except Exception as e:
        print(f"Error creating order: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-payment', methods=['POST'])
def verify_payment():
    """Verify Razorpay payment signature."""
    try:
        data = request.json
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return jsonify({'error': 'Missing verification parameters'}), 400
            
        # Verify signature
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        # The library's utility function verifies the signature
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        return jsonify({'status': 'success', 'message': 'Payment verified successfully'})
        
    except razorpay.errors.SignatureVerificationError:
        return jsonify({'error': 'Payment verification failed'}), 400
    except Exception as e:
        print(f"Error verifying payment: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-order-cod', methods=['POST'])
def create_order_cod():
    """Create a Cash on Delivery order."""
    try:
        data = request.json
        customer_details = data.get('customerDetails', {})
        items = data.get('items', [])
        total = data.get('total', 0)
        
        # Generate order ID
        import random
        import string
        order_id = 'VERSE' + ''.join(random.choices(string.digits, k=6))
        
        # Store order (in production, save to database)
        order_data = {
            'orderId': order_id,
            'customerDetails': customer_details,
            'items': items,
            'total': total,
            'paymentMethod': 'cod',
            'status': 'processing',
            'createdAt': str(datetime.now())
        }
        
        print(f"COD Order created: {order_id}")
        print(f"Customer: {customer_details.get('fullName')}")
        print(f"Total: ₹{total}")
        
        return jsonify({
            'success': True,
            'orderId': order_id,
            'message': 'Order placed successfully'
        })
        
    except Exception as e:
        print(f"Error creating COD order: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-order-online', methods=['POST'])
def create_order_online():
    """Create an online payment order with Razorpay."""
    try:
        data = request.json
        amount = data.get('amount')
        currency = data.get('currency', 'INR')
        customer_details = data.get('customerDetails', {})
        items = data.get('items', [])
        
        if not amount:
            return jsonify({'error': 'Amount is required'}), 400
            
        order_data = {
            'amount': amount,
            'currency': currency,
            'payment_capture': 1,
            'notes': {
                'customer_name': customer_details.get('fullName', ''),
                'customer_email': customer_details.get('email', ''),
                'customer_phone': customer_details.get('phone', '')
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        # Store order details (in production, save to database)
        print(f"Online Order created: {order['id']}")
        print(f"Customer: {customer_details.get('fullName')}")
        print(f"Amount: ₹{amount/100}")
        
        return jsonify(order)
        
    except Exception as e:
        print(f"Error creating online order: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'message': 'Verse Virtual Try-On API is running'})

@app.route('/api/size-recommend', methods=['POST'])
def size_recommend():
    """AI-powered size recommendation endpoint."""
    try:
        data = request.json
        height = float(data.get('height', 0))
        weight = float(data.get('weight', 0))
        body_type = data.get('bodyType', 'regular')
        fit_preference = data.get('fitPreference', 'regular')
        
        if not height or not weight:
            return jsonify({'error': 'Height and weight are required'}), 400
        
        result = generate_size_recommendation(height, weight, body_type, fit_preference)
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in size recommendation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/style-chat', methods=['POST'])
def style_chat():
    """AI style assistant chat endpoint."""
    try:
        data = request.json
        question = data.get('question', '')
        product_context = data.get('productContext', None)
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        response = generate_style_advice(question, product_context)
        return jsonify({'response': response, 'success': True})
        
    except Exception as e:
        print(f"Error in style chat: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/track-order', methods=['POST'])
def track_order():
    """Order tracking endpoint with mock data."""
    try:
        data = request.json
        order_id = data.get('orderId', '')
        phone = data.get('phone', '')
        
        if not order_id and not phone:
            return jsonify({'error': 'Order ID or phone number is required'}), 400
        
        # Mock order data - replace with real Shiprocket/Shopify integration later
        mock_orders = {
            'VERSE001': {
                'orderId': 'VERSE001',
                'status': 'shipped',
                'estimatedDelivery': '2025-12-12',
                'timeline': [
                    {'status': 'Order Placed', 'date': '2025-12-08', 'location': 'Mumbai'},
                    {'status': 'Processing', 'date': '2025-12-08', 'location': 'Mumbai'},
                    {'status': 'Shipped', 'date': '2025-12-09', 'location': 'Mumbai Hub'},
                    {'status': 'In Transit', 'date': '2025-12-10', 'location': 'Regional Hub'}
                ]
            },
            'VERSE002': {
                'orderId': 'VERSE002',
                'status': 'delivered',
                'estimatedDelivery': '2025-12-09',
                'timeline': [
                    {'status': 'Order Placed', 'date': '2025-12-06', 'location': 'Mumbai'},
                    {'status': 'Processing', 'date': '2025-12-06', 'location': 'Mumbai'},
                    {'status': 'Shipped', 'date': '2025-12-07', 'location': 'Mumbai Hub'},
                    {'status': 'Out for Delivery', 'date': '2025-12-09', 'location': 'Local Hub'},
                    {'status': 'Delivered', 'date': '2025-12-09', 'location': 'Customer Address'}
                ]
            },
            'VERSE003': {
                'orderId': 'VERSE003',
                'status': 'processing',
                'estimatedDelivery': '2025-12-14',
                'timeline': [
                    {'status': 'Order Placed', 'date': '2025-12-10', 'location': 'Mumbai'},
                    {'status': 'Processing', 'date': '2025-12-10', 'location': 'Mumbai'}
                ]
            }
        }
        
        # Find order by ID or phone (mock phone lookup)
        order_data = mock_orders.get(order_id.upper())
        
        if not order_data:
            # If not found by ID, return a generic "not found" response
            return jsonify({
                'found': False,
                'message': 'Order not found. Please check your order ID or contact support.',
                'suggestion': 'Try using order IDs: VERSE001, VERSE002, or VERSE003 for demo purposes.'
            }), 404
        
        # Generate natural language update using Gemini
        natural_update = generate_tracking_update(
            order_data['orderId'],
            order_data['status'],
            order_data['timeline']
        )
        
        return jsonify({
            'found': True,
            'orderId': order_data['orderId'],
            'status': order_data['status'],
            'estimatedDelivery': order_data['estimatedDelivery'],
            'timeline': order_data['timeline'],
            'naturalLanguageUpdate': natural_update
        })
        
    except Exception as e:
        print(f"Error in order tracking: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/gemini-chat', methods=['POST'])
def gemini_chat():
    """General Gemini chat endpoint."""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        context = data.get('context', None)
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        response = call_gemini(prompt, context)
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in Gemini chat: {e}")
        return jsonify({'error': str(e), 'success': False}), 500


if __name__ == '__main__':
    print("🚀 Starting Verse Virtual Try-On API Server...")
    print("📍 API will be available at: http://localhost:7860")
    print("🔧 Virtual Try-On endpoint: /api/tryon")
    print("💳 Payment endpoints: /api/create-order, /api/verify-payment")
    print("🤖 AI endpoints: /api/size-recommend, /api/style-chat, /api/track-order")
    print("\n✨ Server is ready! Press Ctrl+C to stop.\n")
    
    # Get port from environment variable (for Railway) or use default
    port = int(os.getenv('PORT', 7860))
    
    # Run the Flask app (bind to 0.0.0.0 for Railway)
    app.run(host='0.0.0.0', port=port, debug=False)
