 Core imports for video processing, 3D math, and machine learning
import cv2
import numpy as np
import time

# --- 1. SETUP AND INITIALIZATION ---

# Pre-defined model paths for OpenCV's DNN Face Detection
# These models are usually included with the standard OpenCV package.
PROTOTXT_PATH = "deploy.prototxt" # Defines the model architecture
MODEL_PATH = "res10_300x300_ssd_iter_140000.caffemodel" # The pre-trained weights

# We will try to load the model. If it fails, we assume we need to
# download or simplify the detection step, but standard OpenCV packages usually handle this.
try:
    net = cv2.dnn.readNetFromCaffe(PROTOTXT_PATH, MODEL_PATH)
except Exception:
    # If loading fails (often due to missing files), we print a warning
    print("WARNING: Could not load DNN models. Face detection will fail.")
    print("Please ensure 'deploy.prototxt' and 'res10_300x300_ssd_iter_140000.caffemodel' are available.")
    # For now, we will proceed, but detection won't work without them.

# Pre-defined indices for key face points (used for PnP)
# Since DNN detection only gives a bounding box, we will ESTIMATE the location
# of 6 canonical points based on the bounding box geometry for PnP.
# This is a simplification but allows the 3D projection logic to work.

# Canonical face point coordinates (normalized to a 1x1 face box)
# We estimate nose, chin, eye corners, and mouth corners.
CANONICAL_FACE_POINTS = np.array([
    (0.50, 0.40, 0.0),  # Nose Tip (center)
    (0.50, 0.90, -0.1), # Chin
    (0.20, 0.25, 0.0),  # Left Eye Corner
    (0.80, 0.25, 0.0),  # Right Eye Corner
    (0.30, 0.70, 0.0),  # Left Mouth Corner
    (0.70, 0.70, 0.0)   # Right Mouth Corner
], dtype=np.float32)

# Convert normalized coordinates to arbitrary 3D model space (e.g., mm)
# The virtual object coordinates (Section 2) must align with this scale.
# We choose a scale factor and shift the origin to the Nose Tip.
SCALE_FACTOR = 80.0
# The 3D model is shifted so the nose tip (index 0) is at (0, 0, 0)
MODEL_3D_POINTS = CANONICAL_FACE_POINTS * SCALE_FACTOR
MODEL_3D_POINTS -= MODEL_3D_POINTS[0]

# --- 2. VIRTUAL 3D OBJECT DEFINITION (Glasses/Cuboid) ---

# Define the 3D points of the virtual item (a simple wireframe glasses frame).
# These points are defined relative to the Nose Tip origin (0,0,0) established above.
VIRTUAL_OBJECT_3D_POINTS = np.array([
    # Points defining the frame shape (left lens area)
    [-45.0, -45.0, 5.0],  # 0: Top-Left
    [-15.0, -45.0, 5.0],  # 1: Top-Right
    [-15.0, -65.0, 5.0],  # 2: Bottom-Right
    [-45.0, -65.0, 5.0],  # 3: Bottom-Left
    
    # Points defining the right lens area
    [ 15.0, -45.0, 5.0],  # 4: Top-Left
    [ 45.0, -45.0, 5.0],  # 5: Top-Right
    [ 45.0, -65.0, 5.0],  # 6: Bottom-Right
    [ 15.0, -65.0, 5.0],  # 7: Bottom-Left
    
    # Connecting bridge
    [-15.0, -55.0, 5.0],  # 8: Bridge Left
    [ 15.0, -55.0, 5.0]   # 9: Bridge Right
], dtype=np.float32)

# Define how the virtual object points are connected (wireframe/lines)
VIRTUAL_OBJECT_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 0),  # Left Lens Outline
    (4, 5), (5, 6), (6, 7), (7, 4),  # Right Lens Outline
    (8, 9)                           # Bridge Connection
]

# --- 3. HELPER FUNCTIONS ---

def get_camera_matrix(width, height):
    """
    Estimates a simple camera intrinsic matrix.
    """
    focal_length = width
    center = (width / 2, height / 2)
    camera_matrix = np.array(
        [[focal_length, 0, center[0]],
         [0, focal_length, center[1]],
         [0, 0, 1]], dtype="double"
    )
    dist_coeffs = np.zeros((4, 1))
    return camera_matrix, dist_coeffs

def project_and_draw(image, model_points_3d, connections, rvec, tvec, camera_matrix, dist_coeffs, color=(0, 255, 0), thickness=2):
    """
    Projects 3D points onto the 2D image plane and draws the specified connections.
    """
    image_points_2d, _ = cv2.projectPoints(model_points_3d, rvec, tvec, camera_matrix, dist_coeffs)
    image_points_2d = image_points_2d.reshape(-1, 2).astype(int)

    for i, j in connections:
        pt1 = tuple(image_points_2d[i])
        pt2 = tuple(image_points_2d[j])
        cv2.line(image, pt1, pt2, color, thickness)
    
    return image

def estimate_face_landmarks_from_box(detection, w, h):
    """
    Estimates the 6 required PnP 2D points based on the bounding box returned by the DNN.
    This is an approximation for head tracking when detailed landmarks are unavailable.
    """
    box = detection[0, 0, 0, 3:7] * np.array([w, h, w, h])
    (startX, startY, endX, endY) = box.astype("int")
    
    # Normalize face box dimensions to 0-1 for easy mapping
    face_w = endX - startX
    face_h = endY - startY
    
    # Map normalized canonical points (0-1) to actual pixel coordinates (startX:endX, startY:endY)
    image_points_2d = []
    
    # Order matches MODEL_3D_POINTS: Nose, Chin, Left Eye, Right Eye, Left Mouth, Right Mouth
    for (nx, ny, _) in CANONICAL_FACE_POINTS:
        # x_pixel = startX + nx * face_width
        # y_pixel = startY + ny * face_height
        x_pixel = startX + int(nx * face_w)
        y_pixel = startY + int(ny * face_h)
        image_points_2d.append((x_pixel, y_pixel))

    return np.array(image_points_2d, dtype="double")


# --- 4. MAIN APPLICATION LOOP ---

def virtual_try_on_app():
    """
    Main function to run the OpenCV DNN-based virtual try-on application.
    """
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam. Check camera connection or permissions.")
        return

    pTime = 0
    CONFIDENCE_THRESHOLD = 0.7

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            continue

        image = cv2.flip(image, 1)
        h, w = image.shape[:2]
        
        camera_matrix, dist_coeffs = get_camera_matrix(w, h)
        
        # 2. Prepare image for DNN (Deep Neural Network)
        # The model expects a 300x300 BGR blob
        blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))

        # 3. Detect Face
        if 'net' in locals():
            net.setInput(blob)
            detections = net.forward()
        else:
            detections = [] # Skip detection if model failed to load

        
        # 4. Process Detection Results
        if len(detections) > 0:
            # Loop over the detections
            for i in range(0, detections.shape[2]):
                confidence = detections[0, 0, i, 2]

                # Filter out weak detections
                if confidence > CONFIDENCE_THRESHOLD:
                    
                    # Estimate the 6 canonical face points from the detected bounding box
                    image_points_2d = estimate_face_landmarks_from_box(detections[0, 0, i:i+1], w, h)
                    
                    # 5. Use PnP to estimate the pose
                    (success, rvec, tvec) = cv2.solvePnP(
                        MODEL_3D_POINTS, 
                        image_points_2d, 
                        camera_matrix, 
                        dist_coeffs, 
                        flags=cv2.SOLVEPNP_ITERATIVE
                    )

                    # 6. Project the virtual object and draw it
                    if success:
                        image = project_and_draw(
                            image, 
                            VIRTUAL_OBJECT_3D_POINTS, 
                            VIRTUAL_OBJECT_CONNECTIONS, 
                            rvec, 
                            tvec, 
                            camera_matrix, 
                            dist_coeffs, 
                            color=(0, 255, 0), # Green glasses frame
                            thickness=3
                        )
                        
                        # Optionally draw the bounding box for debugging
                        # box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                        # (startX, startY, endX, endY) = box.astype("int")
                        # cv2.rectangle(image, (startX, startY), (endX, endY), (0, 0, 255), 2)


        # 7. Display FPS
        cTime = time.time()
        if cTime != pTime:
            fps = 1 / (cTime - pTime)
        else:
            fps = 0
        pTime = cTime
        cv2.putText(image, f'FPS: {int(fps)}', (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 8. Display the final image
        cv2.imshow('3D Virtual Try-On (OpenCV DNN) (Press Q to Exit)', image)

        if cv2.waitKey(5) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    # NOTE: To make this robust, you need to download two files and place them
    # in the same directory:
    # 1. deploy.prototxt
    # 2. res10_300x300_ssd_iter_140000.caffemodel
    # You can find these by searching "OpenCV DNN Face Detection model files"
    
    print("--- 3D Virtual Try-On Application (OpenCV DNN) ---")
    print("Requires: opencv-python, numpy")
    print("Requires model files: deploy.prototxt and res10_300x300_ssd_iter_140000.caffemodel")
    print("Press 'Q' on the video window to exit.")
    print("--------------------------------------")
    
    virtual_try_on_app()