import face_recognition
import cv2
import numpy as np
import json
import os

def setup_face_encoding():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera")
        return

    print("\nFace Capture Instructions:")
    print("1. Position your face in the center of the frame")
    print("2. Wait for the green rectangle to appear around your face")
    print("3. Press SPACE to capture your face")
    print("4. Press 'q' to quit\n")

    face_saved = False

    while not face_saved:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to grab frame")
            continue

        # Convert BGR to RGB
        rgb_frame = frame[:, :, ::-1]

        # Detect face
        face_locations = face_recognition.face_locations(rgb_frame, model="hog")

        # Draw overlay
        display_frame = frame.copy()
        if face_locations:
            top, right, bottom, left = face_locations[0]
            cv2.rectangle(display_frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(display_frame, "Face Detected - Press SPACE", (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        else:
            cv2.putText(display_frame, "No Face Detected", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Show instructions
        cv2.putText(display_frame, "Press SPACE to capture", (10, display_frame.shape[0] - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        cv2.imshow("Capture Face", display_frame)

        key = cv2.waitKey(1) & 0xFF

        if key == 32:  # SPACE
            print("SPACE key detected!")
            if face_locations:
                try:
                    print("Attempting to capture face...")
                    # Get face encoding directly
                    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                    if face_encodings:
                        face_encoding = face_encodings[0].tolist()

                        # Save encoding to JSON file
                        with open('authorized_face.json', 'w') as f:
                            json.dump(face_encoding, f)

                        if os.path.exists('authorized_face.json') and os.path.getsize('authorized_face.json') > 0:
                            print("Face encoding saved successfully!")
                            face_saved = True
                            break
                        else:
                            print("Error: File save failed or is empty")
                    else:
                        print("Error: No face encodings generated")
                except Exception as e:
                    print(f"Error saving face encoding: {e}")
            else:
                print("No face detected! Please center your face.")
        elif key == ord('q'):
            print("Setup cancelled by user")
            break

    cap.release()
    cv2.destroyAllWindows()

    if face_saved:
        print("\nSetup complete! You can now run room_monitor.py")
    else:
        print("\nSetup failed. Please try again.")

if __name__ == "__main__":
    setup_face_encoding()
