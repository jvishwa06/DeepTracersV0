import os
import json
import hashlib
import random
import logging
import numpy as np
import librosa
import torch
import cv2
import matplotlib
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from collections import Counter
from facenet_pytorch import MTCNN, InceptionResnetV1
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt
from google_img_source_search import ReverseImageSearcher
from datetime import datetime
from werkzeug.utils import secure_filename

matplotlib.use('Agg')  

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": ["http://localhost:3000", "http://localhost:5173"]}})

DEVICE = 'cuda:0' if torch.cuda.is_available() else 'cpu'

mtcnn = MTCNN(select_largest=False, post_process=False, device=DEVICE).to(DEVICE).eval()
model = InceptionResnetV1(pretrained='vggface2', classify=True, num_classes=1, device=DEVICE)
checkpoint_path = os.path.join(os.path.dirname(__file__), 'resnetinceptionvit.pth')
checkpoint = torch.load(checkpoint_path, map_location=torch.device('cpu'),weights_only=True)
model.load_state_dict(checkpoint['model_state_dict'])
model.to(DEVICE).eval()

UPLOAD_FOLDER = 'uploads'
MEDIA_FOLDER = 'media'  
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MEDIA_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MEDIA_FOLDER'] = MEDIA_FOLDER

rev_img_searcher = ReverseImageSearcher()

DATABASE = 'predictions.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        time TEXT,
        platform TEXT,
        status TEXT,
        confidence REAL,
        media_format TEXT 
    )''')
    conn.commit()
    conn.close()

def save_to_db(status, confidence, media_format):
    now = datetime.now()
    date = now.strftime("%Y-%m-%d")
    time = now.strftime("%H:%M:%S")
    platform = "instagram"  

    confidence = round(confidence, 2)

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO predictions (date, time, platform, status, confidence, media_format)
                      VALUES (?, ?, ?, ?, ?, ?)''', (date, time, platform, status, confidence, media_format))
    conn.commit()
    conn.close()

def format_frames(frame, output_size):
    return cv2.resize(frame, output_size)

def frames_from_video_file(video_path, n_frames, output_size=(224, 224), frame_step=15):
    result = []
    src = cv2.VideoCapture(video_path)
    video_length = int(src.get(cv2.CAP_PROP_FRAME_COUNT))
    need_length = 1 + (n_frames - 1) * frame_step

    start = 0 if need_length > video_length else random.randint(0, video_length - need_length)
    src.set(cv2.CAP_PROP_POS_FRAMES, start)

    ret, frame = src.read()
    if not ret:
        return np.zeros((n_frames, *output_size, 3), dtype=np.uint8)

    result.append(format_frames(frame, output_size))

    for _ in range(n_frames - 1):
        for _ in range(frame_step):
            ret, frame = src.read()
        result.append(format_frames(frame, output_size) if ret else np.zeros_like(result[0]))

    src.release()
    return np.array(result)

def pred(image_path: str):
    img = Image.open(image_path).convert('RGB')
    face = mtcnn(img)
    if face is None:
        return "no_face_detected", 0  

    face = face.unsqueeze(0).to(DEVICE).float() / 255.0
    with torch.no_grad():
        output = torch.sigmoid(model(face).squeeze(0))
        confidence = output.item()
        status = "real" if confidence < 0.5 else "fake"
        return status, confidence

def predictFake(path):
    m, _ = librosa.load(path, sr=16000)
    mfccs = librosa.feature.mfcc(y=m, sr=16000, n_mfcc=40)
    max_length = 500

    if mfccs.shape[1] < max_length:
        mfccs = np.pad(mfccs, ((0, 0), (0, max_length - mfccs.shape[1])), mode='constant')
    else:
        mfccs = mfccs[:, :max_length]

    model_path = os.path.join(os.path.dirname(__file__), 'audio_classifier.h5')
    model = load_model(model_path)
    output = model.predict(mfccs.reshape(-1, 40, 500))
    confidence = output[0][0]
    status = "fake" if confidence > 0.5 else "real"
    return status, confidence

def save_images(path):
    paths = []
    for i in range(3):
        image_3d = frames_from_video_file(path, 3)[i]
        if image_3d.shape[2] == 4:
            image_3d = image_3d[:, :, :3]
        plt.figure(figsize=(1, 1))
        plt.imshow(image_3d)
        plt.axis('off')
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], f"image{i}.jpg")
        paths.append(save_path)
        plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
        plt.close()
    return paths

def find_mode(arr):
    counts = Counter(arr)
    max_count = max(counts.values())
    return next(key for key, value in counts.items() if value == max_count)

def reverse_image_search(image_path):
    res = rev_img_searcher.search_by_file(image_path)
    search_results = []
    for search_item in res:
        search_results.append({
            'title': search_item.page_title,
            'site': search_item.page_url,
            'img': search_item.image_url
        })
    return search_results

def hash_file(file_path):
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def prepare_metadata(file_path, owner):
    filename = os.path.basename(file_path)
    timestamp = datetime.now().isoformat()
    file_hash = hash_file(file_path)
    metadata = {
        "filename": filename,
        "timestamp": timestamp,
        "file_hash": file_hash,
        "owner": owner
    }
    metadata_json = json.dumps(metadata, indent=4)
    return metadata_json

def save_media_and_metadata(file, owner, media_format):
    try:
        media_folder = app.config['MEDIA_FOLDER']
        file_path = os.path.join(media_folder, secure_filename(file.filename))
        file.save(file_path)  

        if not os.path.exists(file_path):
            raise Exception(f"Failed to save the file: {file.filename}")

        metadata_json = prepare_metadata(file_path, owner)
        metadata_file_path = os.path.join(media_folder, f"{os.path.splitext(file.filename)[0]}.json")
        with open(metadata_file_path, 'w') as json_file:
            json_file.write(metadata_json)

        return file_path, metadata_file_path
    except Exception as e:
        logging.error(f"Error saving media or metadata: {e}")
        raise

@app.route('/upload', methods=['POST'])
def upload_file():
    owner = "DeepTracers"  

    if 'image' in request.files:
        file = request.files['image']
        if not file.filename:
            return jsonify({'error': 'No selected file'})

        media_format = 'image'
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
        file.save(upload_path)

        try:
            status, confidence = pred(upload_path)
            logging.info(f'Prediction: {status}, Confidence: {confidence}')
            save_to_db(status, confidence, media_format)

            reverse_search_results = []
            if status == "real":
                reverse_search_results = reverse_image_search(upload_path)
            else:
                logging.info(f"Deepfake detected: Skipping saving of {file.filename}")

            saved_file_path, metadata_file_path = save_media_and_metadata(file, owner, media_format)

            return jsonify({
                'prediction': status, 
                'confidence': confidence,
                'reverse_search_results': reverse_search_results,  
                'metadata_file': metadata_file_path,  
                'message': status == "fake" and "Deepfake detected, file not saved." or None
            })

        except Exception as e:
            logging.error(f'Error in image prediction or saving: {str(e)}')
            return jsonify({'error': str(e)})

        finally:
            if os.path.exists(upload_path):
                os.remove(upload_path)  

    elif 'audio' in request.files:
        file = request.files['audio']
        if not file.filename:
            return jsonify({'error': 'No selected file'})

        media_format = 'audio'
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
        file.save(upload_path)

        try:
            status, confidence = predictFake(upload_path)
            logging.info(f'Audio Prediction: {status}, Confidence: {confidence}')
            save_to_db(status, confidence, media_format)

            if status == "real":
                saved_file_path, metadata_file_path = save_media_and_metadata(file, owner, media_format)
                return jsonify({
                    'prediction': status, 
                    'confidence': confidence,
                    'metadata_file': metadata_file_path
                })
            else:
                logging.info(f"Deepfake detected: Skipping saving of {file.filename}")
                return jsonify({
                    'prediction': status, 
                    'confidence': confidence,
                    'message': "Deepfake detected, file not saved."
                })

        except Exception as e:
            logging.error(f'Error in audio prediction: {str(e)}')
            return jsonify({'error': str(e)})

        finally:
            if os.path.exists(upload_path):
                os.remove(upload_path)  # Clean up after processing

    elif 'video' in request.files:
        file = request.files['video']
        if not file.filename:
            return jsonify({'error': 'No selected file'})

        media_format = 'video'
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
        file.save(upload_path)

        try:
            paths = save_images(upload_path)
            predictions = []
            confidences = []

            for i in paths:
                try:
                    status, confidence = pred(i)
                    predictions.append(status)
                    confidences.append(confidence)
                    logging.info(f'Frame Prediction: {status} for image {i}, Confidence: {confidence}')
                except Exception as e:
                    predictions.append("error")
                    confidences.append(0)
                    logging.error(f'Error in frame prediction for image {i}: {str(e)}')

            final_prediction = find_mode(predictions)
            final_confidence = sum(confidences) / len(confidences)
            logging.info(f'Mode Prediction: {final_prediction}, Average Confidence: {final_confidence}')
            save_to_db(final_prediction, final_confidence, media_format)

            if final_prediction == "real":
                saved_file_path, metadata_file_path = save_media_and_metadata(file, owner, media_format)
                return jsonify({
                    'prediction': final_prediction, 
                    'confidence': final_confidence,
                    'metadata_file': metadata_file_path
                })
            else:
                logging.info(f"Deepfake detected: Skipping saving of {file.filename}")
                return jsonify({
                    'prediction': final_prediction, 
                    'confidence': final_confidence,
                    'message': "Deepfake detected, file not saved."
                })

        except Exception as e:
            logging.error(f'Error in video processing: {str(e)}')
            return jsonify({'error': str(e)})

        finally:
            if os.path.exists(upload_path):
                os.remove(upload_path)  

    else:
        return jsonify({'error': 'No valid file provided'})

if __name__ == '__main__':
    init_db()  
    app.run(debug=True, port=5000, host='0.0.0.0')
