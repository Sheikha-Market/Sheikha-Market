import cv2
import numpy as np
for idx in [0, 1]:
    cap = cv2.VideoCapture(idx, cv2.CAP_V4L2)
    print(f"--- Camera {idx} opened: {cap.isOpened()}")
    if not cap.isOpened():
        continue
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    for i in range(5):
        ret, frame = cap.read()
        if ret and frame is not None:
            print(f"  try {i}: brightness {np.mean(frame):.1f} shape {frame.shape}")
            if np.mean(frame) > 5:
                cv2.imwrite(f"sheikha-eye-{idx}.jpg", frame)
                print(f"  SAVED sheikha-eye-{idx}.jpg - SEEING")
                break
    cap.release()
