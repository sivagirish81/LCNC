import face_recognition
import cv2
import numpy as np
import json
import time
from datetime import datetime

def load_authorized_face():
    try:
        with open('authorized_face.json', 'r') as f:
            return np.array(json.load(f))
    except FileNotFoundError:
        print("Error: authorized_face.json not found. Please run setup_db.py first.")
        return None

def monitor_room():
    # Load the authorized face encoding
    authorized_encoding = load_authorized_face()
    if authorized_encoding is None:
        return
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera")
        return
    
    print("\nStarting room monitoring...")
    print("Press 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        
        # Convert BGR to RGB
        rgb_frame = frame[:, :, ::-1]
        
        # Detect faces
        face_locations = face_recognition.face_locations(rgb_frame, model="hog")
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        
        # Check each detected face
        for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
            # Compare with authorized face
            matches = face_recognition.compare_faces([authorized_encoding], face_encoding, tolerance=0.6)
            
            if matches[0]:
                # Authorized face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                cv2.putText(frame, "Authorized", (left, top - 10),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            else:
                # Unauthorized face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
                cv2.putText(frame, "Unauthorized", (left, top - 10),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                # Print warning to terminal
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"\n🚨 UNAUTHORIZED ACCESS DETECTED at {timestamp}")
        
        # Display the frame
        cv2.imshow("Room Monitor", frame)
        
        # Break loop on 'q' press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    monitor_room()