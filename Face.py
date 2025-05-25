import cv2
import os
from google.cloud import vision
from google.oauth2 import service_account
import numpy as np

# Initialize the Google Cloud Vision client
# Replace 'path/to/your/credentials.json' with your actual credentials file path
credentials = service_account.Credentials.from_service_account_file(
    './creds.json')
client = vision.ImageAnnotatorClient(credentials=credentials)

# Initialize webcam
cap = cv2.VideoCapture(0)

# Load the known face (you'll need to save a reference image)
known_face_path = 'ss.jpeg'
with open(known_face_path, 'rb') as image_file:
    content = image_file.read()
known_face = vision.Image(content=content)
known_face_response = client.face_detection(image=known_face)
known_face_landmarks = known_face_response.face_annotations[0]

def compare_faces(face1, face2):
    try:
        # Get facial landmarks
        landmarks1 = face1.landmarks
        landmarks2 = face2.landmarks
        
        # Get nose tip positions
        nose1 = landmarks1[0]  # First landmark is usually the nose tip
        nose2 = landmarks2[0]
        
        # Get left eye positions (usually landmarks 1 and 2)
        left_eye1 = landmarks1[1]
        left_eye2 = landmarks2[1]
        
        # Get right eye positions (usually landmarks 3 and 4)
        right_eye1 = landmarks1[3]
        right_eye2 = landmarks2[3]
        
        # Calculate distances between facial features
        nose_distance = np.sqrt(
            (nose1.position.x - nose2.position.x)**2 +
            (nose1.position.y - nose2.position.y)**2
        )
        
        left_eye_distance = np.sqrt(
            (left_eye1.position.x - left_eye2.position.x)**2 +
            (left_eye1.position.y - left_eye2.position.y)**2
        )
        
        right_eye_distance = np.sqrt(
            (right_eye1.position.x - right_eye2.position.x)**2 +
            (right_eye1.position.y - right_eye2.position.y)**2
        )
        
        # Calculate average distance
        avg_distance = (nose_distance + left_eye_distance + right_eye_distance) / 3
        
        # Print distances for debugging
        print(f"Nose distance: {nose_distance:.4f}")
        print(f"Left eye distance: {left_eye_distance:.4f}")
        print(f"Right eye distance: {right_eye_distance:.4f}")
        print(f"Average distance: {avg_distance:.4f}")
        
        # Increased threshold for matching
        return avg_distance < 0.7  # Increased from 0.1 to 0.3
        
    except Exception as e:
        print(f"Error in compare_faces: {e}")
        return False

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Convert frame to bytes
    _, img_encoded = cv2.imencode('.jpg', frame)
    content = img_encoded.tobytes()
    
    # Create Vision API image
    image = vision.Image(content=content)
    
    try:
        # Detect faces
        response = client.face_detection(image=image)
        faces = response.face_annotations
        
        if faces:
            # Compare each detected face with the known face
            for face in faces:
                try:
                    # Get face detection confidence
                    detection_confidence = face.detection_confidence
                    print(f"Face detection confidence: {detection_confidence:.2f}")
                    
                    if compare_faces(face, known_face_landmarks):
                        cv2.putText(frame, "Authorized", (50, 50),
                                  cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    else:
                        cv2.putText(frame, "INTRUDER", (50, 50),
                                  cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    
                    # Draw rectangle around face
                    vertices = [(vertex.x, vertex.y) for vertex in face.bounding_poly.vertices]
                    cv2.polylines(frame, [np.array(vertices)], True, (0, 255, 0), 2)
                except Exception as e:
                    print(f"Error processing face: {e}")
                    continue
        
    except Exception as e:
        print(f"Error: {e}")
    
    # Display the frame
    cv2.imshow('Face Authentication', frame)
    
    # Break loop on 'q' press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()