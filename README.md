# **DeepTracersV0 - Advanced Deepfake Detection Platform with Social Media Integration**

Welcome to **DeepTracersV0**, an advanced platform designed to detect deepfakes in images, audio, and video content uploaded on social media platforms. Utilizing cutting-edge AI models and blockchain technology, DeepTracersV0 ensures the integrity of media and provides verifiable evidence for real posts, while flagging deepfakes for further investigation by cybersecurity professionals.

---

## **Overview**

**DeepTracersV0** offers users a seamless social media experience, where uploaded media content undergoes analysis for potential deepfakes. The platform leverages an advanced hybrid AI model (**ResNet50**, **Inceptionv3**, and **Vision Transformer**) trained on industry-leading datasets. If a deepfake is detected, the post is flagged, blocked, and reported to cybersecurity experts. For real posts, cryptographic hashes are generated and stored on the blockchain for traceability.

---

## **Key Features**

1. ### **Deepfake Detection**  
   - **Hybrid AI Model**: Combines **ResNet50**, **Inceptionv3**, and **Vision Transformer** for high accuracy in detecting deepfakes. Models are trained on **DFDC** and **FaceForensics++** datasets. Post-training full integer quantization ensures near real-time prediction.
   - **User Notification**: Users are notified when a deepfake is detected, and the post is blocked from being uploaded.
   - **Cybersecurity Reporting**: Multiple deepfake detections trigger an automatic report to cybersecurity professionals for investigation.

2. ### **Cryptographic Hash for Real Posts**  
   - **Blockchain Traceability**: Genuine posts receive a unique cryptographic hash, along with metadata, which is stored on a blockchain for future verification and to mitigate deepfake concerns.

3. ### **Cybersecurity and Law Enforcement Platform**  
   - **Investigation Interface**: Provides a comprehensive interface for cybersecurity professionals to upload and investigate suspicious media (supports multiple formats including **png, jpg, jpeg, webp, mp4, mp3, wav**).
   - **Explainable AI (XAI)**: Displays key features(feature maps) and reasons for identifying content as a deepfake.
   - **Dashboard Analytics**: Displays insights such as blocked deepfakes, mediums of origin (e.g., Instagram, Facebook, YouTube, X), and the number of reported and resolved cases, etc.,

4. ### **Reverse Image Search**  
   - Allows users to perform reverse image searches to find the origin of an uploaded image and report/remove fake content.

5. ### **Q&A Chatbot**  
   - An **integrated chatbot** running locally on the platform using the Ollama framework to assist users with any questions or concerns.

6. ### **Mobile Application**  
   - A mobile app with basic functionalities of the **DeepTracersV0** platform, available for users on the go.

7. ### **Python Package and API Services**  
   - **DeepTracer Python Package**: Offers developers a convenient API for detecting deepfakes in media content, with easy-to-use functions for image and video validation.

---

## **Demonstration Video**

For a detailed walkthrough and demonstration of the project, please refer to the following video:

[Watch Demonstration Video](https://drive.google.com/file/d/1fascxIRZNizfNduBNshH2JYqlhXwJ1Dl/view?usp=drive_link)

---

### **Future Updates** ###
Implement **audio-visual feature fusion architecture** to integrate multimodal data and improve performance.
Integrate NAS (Neural Architecture Search) to automatically discover the best-performing neural network architecture.
Develop a **reverse darkweb search** for identifying hidden deepfake content through pattern matching.
Create a **Chrome extension** for client-side and server-side processing, optimizing data handling and performance.
Continuously enhance system performance and security to ensure efficient and secure data processing.

---

## **Datasets Used for Model Training**

The detection model was trained using the following datasets:
- **FaceForensics++ (FF)**
- **DeepFake Detection Dataset (DFD)**

In addition to publicly available datasets, the model was enhanced with scraped data of Indian political leaders and celebrities, adding more diversity and robustness to the training set.

---

## **Technology Stack**

- **Frontend**: HTML, Tailwind CSS, React + Vite, Streamlit
- **Backend**: Flask
- **Database**: MySQL
- **AI Frameworks & Libraries**: PyTorch, TensorFlow, OpenCV, FaceNet_PyTorch, GradCAM, NumPy, Matplotlib, sqlite3, Langchain_Ollama, Google Image Source Search

---

## **Model Details**

- **Federated Learning**: To handle computational complexity, separate models were trained for each dataset and combined through federated learning to create a unified model.
- **Accuracy**: The model achieved an impressive **98.64%** accuracy on Visual Model & **99.16** on Audio Model
- **Inference Speed**: With **Post-Training Full Integer Quantization**, the model achieves inference speeds of **150ms-200ms** on Nvidia RTX4090, ensuring fast and efficient real-time predictions.

---

## **Key Use Cases**

1. **Content Moderation**  
   Social media platforms like Instagram, YouTube, Facebook, and Twitter can integrate **DeepTracersV0** to identify and flag deepfake content before it spreads.

2. **Cybersecurity & Law Enforcement**  
   Cybersecurity experts and law enforcement agencies can use **DeepTracersV0** to investigate malicious or manipulated media, helping prevent fraud and misinformation.

---

## **Installation and Setup**

Follow the steps below to install and run **DeepTracersV0**:

### **1. Clone the repository**
```bash
git clone https://github.com/jvishwa06/DeepTracers.git
cd DeepTracers
```

### **2. Create and activate a virtual environment**
```bash
python -m venv deeptracer-venv
source deeptracer-venv/Scripts/activate.bat  # For Windows
```

### **3. Install dependencies**
```bash
pip install -r requirements.txt
```

### **4. Running the platform**

#### **Frontend (React Web Application)**
Navigate to the React application directory and install dependencies:
```bash
cd WebApplication/my-app
npm install
```
Start the development server:
```bash
npm run dev
```

#### **Frontend (React Mobile Application)**
Navigate to the React application directory and install dependencies:
```bash
cd MobileApplication
npm install
```
Start the development server:
```bash
npm start
```
#### **Download Pretrained Model**

To run the backend services, you need to download the pretrained model from Google Drive and place it in the `Backend` folder.

1. Download the pretrained model from the following link:
   [Download Model](https://drive.google.com/file/d/1b09s-sv2IFC4l4FMvkzaVaJrtJuRVYjw/view?usp=drive_link)

2. After downloading, place the model file in the `Backend` folder of your project.


#### **Backend (Flask Application)**
Start the necessary backend services:
```bash
python Backend/DeepfakeBackend.py
python Backend/DatabaseBackend.py
python Backend/ChatbotBackend.py
```

### **5. Testing Media Integration**
```bash
cd InstagramPrototype
npm install
npm run dev
```

### **6. Testing Python Package**
```bash
pip install deeptracer
```

Example usage:
```python
from deeptracer import DeepFakeDetector
detector = DeepFakeDetector()
image_result = detector.predict_image('path/image.jpg')
print(image_result)
image_result = detector.predict_video('path/video.mp4')
print(video_result)
```

---

## **License**

This project is licensed under the **MIT License**. See the [LICENSE](https://opensource.org/licenses/MIT) file for more information.

---

Feel free to contribute to the project or reach out if you encounter any issues. We welcome your feedback!

---
