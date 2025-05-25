import face_recognition
import numpy as np
import cv2
from typing import List, Tuple, Optional

def get_face_encodings(frame: np.ndarray) -> Tuple[List[np.ndarray], List[Tuple[int, int, int, int]]]:
    """Extract face encodings from a frame."""
    # Convert BGR to RGB (face_recognition uses RGB)
    rgb_frame = frame[:, :, ::-1]
    
    # Find face locations
    face_locations = face_recognition.face_locations(rgb_frame, model="hog")
    
    if not face_locations:
        return [], []
    
    # Get face encodings - using the correct function signature
    try:
        # Convert face_locations to the correct format
        face_encodings = []
        for face_location in face_locations:
            # Get the face encoding for each face location
            face_encoding = face_recognition.face_encodings(rgb_frame, [face_location])[0]
            face_encodings.append(face_encoding)
        return face_encodings, face_locations
    except Exception as e:
        print(f"Error encoding faces: {e}")
        return [], []

def compare_faces(known_encoding: np.ndarray, face_encoding: np.ndarray, tolerance: float = 0.6) -> bool:
    """Compare a known face encoding with a detected face encoding."""
    try:
        return face_recognition.compare_faces([known_encoding], face_encoding, tolerance=tolerance)[0]
    except Exception as e:
        print(f"Error comparing faces: {e}")
        return False

def detect_and_encode_face(frame: np.ndarray) -> Optional[np.ndarray]:
    """Detect and encode a single face from a frame."""
    # Convert BGR to RGB
    rgb_frame = frame[:, :, ::-1]
    
    # Find face locations
    face_locations = face_recognition.face_locations(rgb_frame, model="hog")
    
    if not face_locations:
        return None
    
    try:
        # Get face encoding for the first face found
        face_encodings = face_recognition.face_encodings(rgb_frame, [face_locations[0]])
        return face_encodings[0] if face_encodings else None
    except Exception as e:
        print(f"Error encoding face: {e}")
        return None