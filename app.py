import gradio as gr
from gradio_client import Client, handle_file
import os
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np
import tempfile

# Initialize the client
client = Client("yisol/IDM-VTON")

GARMENT_DIR = "garments"
BACKGROUND_DIR = "backgrounds"
OUTPUT_DIR = "outputs"

for dir_path in [GARMENT_DIR, BACKGROUND_DIR, OUTPUT_DIR]:
    os.makedirs(dir_path, exist_ok=True)

def get_garments():
    """Load all images from the garments directory."""
    garments = []
    if os.path.exists(GARMENT_DIR):
        for file in os.listdir(GARMENT_DIR):
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                garments.append(os.path.join(GARMENT_DIR, file))
    return garments

def get_backgrounds():
    """Load all images from the backgrounds directory."""
    backgrounds = []
    if os.path.exists(BACKGROUND_DIR):
        for file in os.listdir(BACKGROUND_DIR):
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                backgrounds.append(os.path.join(BACKGROUND_DIR, file))
    return backgrounds

def create_video_from_image(image_path, duration=4):
    """Create a short video with dynamic movements from a static image."""
    try:
        import imageio
        from PIL import ImageDraw
        
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

def apply_custom_background(result_image_path, background_path):
    """Apply a custom background to the result image."""
    try:
        if not background_path:
            return result_image_path
        
        # Load images
        result = Image.open(result_image_path).convert("RGBA")
        background = Image.open(background_path).convert("RGBA")
        
        # Resize background to match result
        background = background.resize(result.size, Image.Resampling.LANCZOS)
        
        # Simple edge detection to create a rough mask
        # Convert to grayscale for edge detection
        gray = result.convert('L')
        edges = gray.filter(ImageFilter.FIND_EDGES)
        
        # Create a simple mask based on the result image
        # This is a simplified approach - ideally we'd use the mask from IDM-VTON
        # For now, we'll just blend the images
        blended = Image.blend(background.convert("RGB"), result.convert("RGB"), alpha=0.7)
        
        output_path = os.path.join(OUTPUT_DIR, f"bg_result_{os.getpid()}.png")
        blended.save(output_path)
        
        return output_path
    except Exception as e:
        print(f"Error applying background: {e}")
        return result_image_path

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

def tryon(person_image, garment_image, description, background_image, generate_video):
    if not person_image or not garment_image:
        return None, None, "❌ Please upload both person and garment images"
    
    print(f"Processing Verse Virtual Try-On for: {description}")
    
    # AUTO-CROP PERSON FROM IMAGE
    print("🔍 Detecting and cropping person from uploaded image...")
    cropped_person_image = detect_and_crop_person(person_image)
    
    person_image_dict = {
        "background": handle_file(cropped_person_image),
        "layers": [],
        "composite": None
    }
    
    try:
        result = client.predict(
            dict=person_image_dict,
            garm_img=handle_file(garment_image),
            garment_des=description,
            is_checked=True,
            is_checked_crop=True,  # Enable garment cropping for perfect fit
            denoise_steps=50,  # Optimal quality for best fitting
            seed=42,
            api_name="/tryon"
        )
        
        result_image_path = result[0]
        
        # Apply custom background if provided
        if background_image:
            print("Applying custom background...")
            result_image_path = apply_custom_background(result_image_path, background_image)
        
        # Generate video if requested
        video_path = None
        if generate_video:
            print("Generating video...")
            video_path = create_video_from_image(result_image_path, duration=4)
            if video_path:
                return result_image_path, video_path, "✅ Try-on complete with video!"
            else:
                return result_image_path, None, "✅ Try-on complete (video generation failed)"
        
        return result_image_path, None, "✅ Try-on complete!"
        
    except Exception as e:
        print(f"Error during API call: {e}")
        import traceback
        traceback.print_exc()
        raise gr.Error(f"API Error: {str(e)}")

# Custom CSS for Verse branding - Vibrant, Modern, Professional Design
custom_css = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
    
    :root {
        /* Vibrant Color Palette */
        --primary-gradient: linear-gradient(135deg, #6366F1 0%, #EC4899 100%);
        --secondary-gradient: linear-gradient(135deg, #14B8A6 0%, #3B82F6 100%);
        --accent-gradient: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
        --bg-gradient: linear-gradient(135deg, #FEF3F4 0%, #F3E8FF 50%, #E0F2FE 100%);
        
        /* Glass Effect Colors */
        --glass-white: rgba(255, 255, 255, 0.85);
        --glass-border: rgba(255, 255, 255, 0.3);
        
        /* Text Colors */
        --text-primary: #1F2937;
        --text-secondary: #6B7280;
        --text-gradient: linear-gradient(135deg, #6366F1 0%, #EC4899 100%);
        
        /* Shadow Colors */
        --shadow-primary: rgba(99, 102, 241, 0.3);
        --shadow-secondary: rgba(236, 72, 153, 0.3);
        --shadow-glow: rgba(99, 102, 241, 0.5);
    }
    
    /* Global Styles */
    * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
    
    .gradio-container {
        background: var(--bg-gradient) !important;
        background-attachment: fixed !important;
    }
    
    /* Animated Header with Gradient Text */
    #verse-header {
        text-align: center;
        background: var(--glass-white);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding: 40px 30px;
        border-radius: 24px;
        margin-bottom: 40px;
        border: 2px solid var(--glass-border);
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2),
                    0 0 60px rgba(236, 72, 153, 0.15);
        animation: fadeInDown 0.8s ease-out;
        position: relative;
        overflow: hidden;
    }
    
    #verse-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 3s infinite;
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    #verse-header h1 {
        font-family: 'Outfit', sans-serif !important;
        font-size: 3.5em !important;
        font-weight: 900 !important;
        margin: 0 !important;
        background: var(--text-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.02em;
        animation: gradientShift 3s ease infinite;
        background-size: 200% 200%;
    }
    
    @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    
    #verse-header p {
        font-size: 1.3em !important;
        margin: 15px 0 0 0 !important;
        color: var(--text-secondary) !important;
        font-weight: 500 !important;
        letter-spacing: 0.02em;
    }
    
    /* Glassmorphism Panels */
    .gr-box, .gr-panel, .gr-form {
        background: var(--glass-white) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border-radius: 20px !important;
        border: 2px solid var(--glass-border) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s ease !important;
    }
    
    .gr-box:hover, .gr-panel:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15) !important;
    }
    
    /* Premium Button Design */
    .verse-button, .gr-button-primary {
        background: var(--primary-gradient) !important;
        border: none !important;
        color: white !important;
        font-weight: 700 !important;
        font-size: 1.1em !important;
        padding: 16px 32px !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 24px var(--shadow-primary),
                    0 4px 12px var(--shadow-secondary) !important;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        position: relative !important;
        overflow: hidden !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .verse-button::before, .gr-button-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
    }
    
    .verse-button:hover, .gr-button-primary:hover {
        transform: translateY(-4px) scale(1.02) !important;
        box-shadow: 0 12px 32px var(--shadow-primary),
                    0 8px 16px var(--shadow-secondary),
                    0 0 40px var(--shadow-glow) !important;
    }
    
    .verse-button:hover::before, .gr-button-primary:hover::before {
        left: 100%;
    }
    
    .verse-button:active, .gr-button-primary:active {
        transform: translateY(-2px) scale(0.98) !important;
    }
    
    /* Input Fields with Gradient Borders */
    .gr-input, .gr-text-input, textarea {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 2px solid transparent !important;
        border-radius: 12px !important;
        padding: 12px 16px !important;
        font-size: 1em !important;
        transition: all 0.3s ease !important;
        background-clip: padding-box !important;
        position: relative;
    }
    
    .gr-input:focus, .gr-text-input:focus, textarea:focus {
        outline: none !important;
        border: 2px solid transparent !important;
        background: white !important;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2),
                    0 4px 12px rgba(99, 102, 241, 0.15) !important;
        transform: translateY(-1px);
    }
    
    /* Enhanced Tabs */
    .tabs {
        border-bottom: 2px solid rgba(99, 102, 241, 0.2) !important;
        margin-bottom: 20px !important;
    }
    
    .tab-nav button {
        font-weight: 600 !important;
        font-size: 1em !important;
        padding: 12px 24px !important;
        color: var(--text-secondary) !important;
        transition: all 0.3s ease !important;
        border-radius: 8px 8px 0 0 !important;
    }
    
    .tab-nav button:hover {
        background: rgba(99, 102, 241, 0.1) !important;
        color: #6366F1 !important;
    }
    
    .tab-nav button.selected {
        background: var(--primary-gradient) !important;
        color: white !important;
        border: none !important;
        box-shadow: 0 4px 12px var(--shadow-primary) !important;
    }
    
    /* Gallery Enhancements */
    .gr-gallery {
        border-radius: 16px !important;
        overflow: hidden !important;
    }
    
    .gr-gallery .thumbnail {
        border-radius: 12px !important;
        transition: all 0.3s ease !important;
        border: 3px solid transparent !important;
    }
    
    .gr-gallery .thumbnail:hover {
        transform: scale(1.05) !important;
        border: 3px solid #6366F1 !important;
        box-shadow: 0 8px 24px var(--shadow-primary) !important;
    }
    
    /* Image Containers with Gradient Borders */
    .gr-image, .gr-video {
        border-radius: 16px !important;
        overflow: hidden !important;
        border: 3px solid transparent !important;
        background: linear-gradient(white, white) padding-box,
                    var(--primary-gradient) border-box !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
    }
    
    /* Headings with Gradient Effect */
    h2, h3 {
        font-family: 'Outfit', sans-serif !important;
        font-weight: 700 !important;
        color: var(--text-primary) !important;
        margin-bottom: 16px !important;
        position: relative;
        padding-left: 16px;
    }
    
    h2::before, h3::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 70%;
        background: var(--primary-gradient);
        border-radius: 3px;
    }
    
    /* Status Text with Color Coding */
    .gr-textbox[label="Status"] {
        font-weight: 600 !important;
    }
    
    /* Animations */
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* Column Animations */
    .gr-column {
        animation: fadeIn 0.6s ease-out;
    }
    
    /* Checkbox Styling */
    input[type="checkbox"] {
        width: 20px !important;
        height: 20px !important;
        accent-color: #6366F1 !important;
    }
    
    /* Loading Spinner Enhancement */
    .loading {
        background: var(--primary-gradient) !important;
    }
    
    /* Scrollbar Styling */
    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.5);
        border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb {
        background: var(--primary-gradient);
        border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: var(--secondary-gradient);
    }
</style>
"""

with gr.Blocks(title="Verse Virtual Try-On") as demo:
    gr.HTML(custom_css + """
        <div id="verse-header">
            <h1>✨ VERSE Virtual Try-On ✨</h1>
            <p>🎨 Experience Your Style in a New Dimension 🌟</p>
        </div>
    """)
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 1️⃣ Upload Your Photo")
            person_input = gr.Image(label="Your Photo", type="filepath", sources=["webcam", "upload"])
            
            gr.Markdown("### 2️⃣ Select Garment")
            with gr.Tabs():
                with gr.TabItem("📦 Collection"):
                    garment_gallery = gr.Gallery(
                        label="Verse Collection", 
                        value=get_garments(), 
                        allow_preview=False, 
                        columns=3, 
                        object_fit="contain", 
                        height=300
                    )
                with gr.TabItem("📤 Upload Custom"):
                    garment_upload = gr.Image(label="Upload Garment", type="filepath", sources=["upload"])
            
            selected_garment = gr.State()
            
            description_input = gr.Textbox(
                label="Garment Description", 
                value="Stylish outfit", 
                placeholder="e.g., Blue denim jacket"
            )
            
            gr.Markdown("### 3️⃣ Customize Background (Optional)")
            with gr.Tabs():
                with gr.TabItem("🎨 Default"):
                    gr.Markdown("*Use original background*")
                    default_bg = gr.State(value=None)
                with gr.TabItem("� Upload Background"):
                    background_upload = gr.Image(label="Custom Background", type="filepath", sources=["upload"])
                with gr.TabItem("🌆 Background Gallery"):
                    background_gallery = gr.Gallery(
                        label="Background Options", 
                        value=get_backgrounds(), 
                        allow_preview=False, 
                        columns=3, 
                        object_fit="contain", 
                        height=200
                    )
            
            selected_background = gr.State()
            
            gr.Markdown("### 4️⃣ Output Options")
            generate_video_checkbox = gr.Checkbox(label="Generate Video (3-5 seconds)", value=False)
            
            submit_btn = gr.Button("✨ Try On Now", variant="primary", size="lg", elem_classes="verse-button")
        
        with gr.Column(scale=1):
            gr.Markdown("### 🎯 Your Result")
            status_text = gr.Textbox(label="Status", value="Ready to try on...", interactive=False)
            output_image = gr.Image(label="Virtual Try-On Result", interactive=False)
            output_video = gr.Video(label="Try-On Video", visible=True)

    # Event handling
    def update_selected_from_gallery(evt: gr.SelectData):
        return evt.value['image']['path']

    def update_selected_from_upload(image_path):
        return image_path
    
    def update_bg_from_gallery(evt: gr.SelectData):
        return evt.value['image']['path']

    garment_gallery.select(update_selected_from_gallery, None, selected_garment)
    garment_upload.change(update_selected_from_upload, garment_upload, selected_garment)
    background_gallery.select(update_bg_from_gallery, None, selected_background)
    background_upload.change(update_selected_from_upload, background_upload, selected_background)

    submit_btn.click(
        fn=tryon,
        inputs=[person_input, selected_garment, description_input, selected_background, generate_video_checkbox],
        outputs=[output_image, output_video, status_text]
    )

if __name__ == "__main__":
    # Production configuration for Render.com
    port = int(os.environ.get("PORT", 7860))
    demo.queue().launch(
        server_name="0.0.0.0",
        server_port=port,
        show_error=True,
        share=False  # Don't create share link in production
    )

