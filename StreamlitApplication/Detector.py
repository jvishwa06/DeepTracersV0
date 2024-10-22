import streamlit as st
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
import cv2
import os
import random
import numpy as np
from PIL import Image
from fpdf import FPDF
import base64
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image
import torch.nn.functional as F
from datetime import datetime

# Model setup
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
mtcnn = MTCNN(select_largest=False, post_process=False, device=device).eval()
model = InceptionResnetV1(pretrained='vggface2', classify=True, num_classes=1, device=device)
checkpoint = torch.load('D:\\DeepTracers\\Backend\\resnetinceptionvit.pth', map_location=device)
model.load_state_dict(checkpoint['model_state_dict'])
model.to(device).eval()

# Helper functions
def format_frames(frame, output_size):
    return cv2.resize(frame, output_size)

def frames_from_video_file(video_path, n_frames=3, output_size=(224, 224), frame_step=15):
    result = []
    src = cv2.VideoCapture(str(video_path))
    video_length = int(src.get(cv2.CAP_PROP_FRAME_COUNT))
    need_length = 1 + (n_frames - 1) * frame_step
    start = random.randint(0, video_length - need_length) if need_length < video_length else 0
    src.set(cv2.CAP_PROP_POS_FRAMES, start)

    for _ in range(n_frames):
        for _ in range(frame_step):
            ret, frame = src.read()
        if ret:
            frame = format_frames(frame, output_size)
            result.append(frame)
        else:
            result.append(np.zeros_like(result[0]))
    src.release()
    return np.array(result)

def predict(input_image: Image.Image):
    face = mtcnn(input_image)
    
    # If no face is detected, return a message
    if face is None:
        return None, "real", None
    
    face = face.unsqueeze(0)  # add the batch dimension
    face = F.interpolate(face, size=(256, 256), mode='bilinear', align_corners=False)
    
    # Convert face tensor to numpy array
    prev_face = face.squeeze(0).permute(1, 2, 0).cpu().detach().numpy()
    prev_face = prev_face.astype('uint8')

    # Convert the face to float32 and normalize to [0, 1]
    face_image_to_plot = face.squeeze(0).permute(1, 2, 0).cpu().detach().numpy()
    face_image_to_plot = face_image_to_plot.astype('float32') / 255.0

    target_layers = [model.block8.branch1[-1]]
    cam = GradCAM(model=model, target_layers=target_layers)
    targets = [ClassifierOutputTarget(0)]

    grayscale_cam = cam(input_tensor=face, targets=targets, eigen_smooth=True)
    grayscale_cam = grayscale_cam[0, :]
    visualization = show_cam_on_image(face_image_to_plot, grayscale_cam, use_rgb=True)
    face_with_mask = cv2.addWeighted(prev_face, 1, visualization, 0.5, 0)

    with torch.no_grad():
        face = face.to(device).float() / 255.0
        output = torch.sigmoid(model(face).squeeze(0))
        prediction = "real" if output.item() < 0.8 else "fake"
        
        real_prediction = 1 - output.item()
        fake_prediction = output.item()
        
        confidences = {
            'real': real_prediction,
            'fake': fake_prediction
        }
    return confidences, prediction, face_with_mask


# PDF generation function
def generate_pdf(image_path, gradcam_image, prediction, confidences, file_name, processing_time, latency):
    # Ensure the 'reports' directory exists
    reports_folder = 'reports'
    if not os.path.exists(reports_folder):
        os.makedirs(reports_folder)

    pdf = FPDF()
    pdf.add_page()

    # Title
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(200, 10, txt="Deepfake Detection Report", ln=True, align='C')
    pdf.ln(10)

    # Date and time
    now = datetime.now()
    pdf.set_font('Arial', '', 12)
    pdf.cell(200, 10, txt=f"Date: {now.strftime('%Y-%m-%d')}", ln=True)
    pdf.cell(200, 10, txt=f"Time: {now.strftime('%H:%M:%S')}", ln=True)
    pdf.cell(200, 10, txt=f"Prepared by: DeepTracers", ln=True)
    pdf.cell(200, 10, txt=f"Contact: deeptracers@gmail.com", ln=True)
    pdf.ln(10)

    # Executive Summary
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="1. Executive Summary", ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, txt="This report provides an analysis of the detected deepfake image, outlining the detection process, results, and implications for cybersecurity and digital forensics.")
    pdf.ln(10)

    # Objectives
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="2. Objectives", ln=True)
    pdf.set_font('Arial', '', 12)
    objectives = [
        "Accuracy: Maintain a high detection accuracy rate across various media formats.",
        "Speed: Ensure rapid processing and analysis with low latency.",
        "User Interface: Provide an easy-to-use interface for professionals.",
        "Reporting: Generate detailed reports when deepfakes are detected."
    ]
    for obj in objectives:
        pdf.cell(200, 10, txt=f"- {obj}", ln=True)
    pdf.ln(10)

    # Methodology
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="3. Methodology", ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, txt="Model Used: InceptionResnetV1 & VisionTransformer.")
    pdf.multi_cell(0, 10, txt="Detection Process: Employed MTCNN for face detection followed by Grad-CAM for visualization.")
    pdf.cell(200, 10, txt=f"Image Input: {os.path.basename(image_path)} - processed and analyzed for deepfake detection.", ln=True)
    pdf.ln(10)

    # Detection Results
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="4. Detection Results", ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.cell(200, 10, txt=f"Prediction: {prediction}", ln=True)
    pdf.cell(200, 10, txt="Confidence Scores:", ln=True)
    pdf.cell(200, 10, txt=f"  Real: {confidences['real']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"  Fake: {confidences['fake']:.2f}", ln=True)
    pdf.ln(10)

    # Grad-CAM Visualization
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="5. Grad-CAM Visualization", ln=True)

    # Display Original and Grad-CAM Images Side by Side
    pdf.cell(95, 10, txt="Original Image:", ln=True)
    pdf.image(image_path, x=10, w=90)
    pdf.cell(95, 10, txt="Grad-CAM Visualization:", ln=True)
    pdf.image(gradcam_image, x=10, w=90)
    pdf.ln(10)

    # System Performance
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="6. System Performance", ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.cell(200, 10, txt=f"Processing Time: {processing_time:.2f} seconds.", ln=True)
    pdf.cell(200, 10, txt=f"Latency: {latency} milliseconds.", ln=True)
    pdf.ln(10)

    # Reporting and Alerts
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="7. Reporting and Alerts", ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.cell(200, 10, txt="Upon detection of a deepfake:", ln=True)
    pdf.cell(200, 10, txt="Report Generated: Yes", ln=True)
    pdf.cell(200, 10, txt=f"Details Included:", ln=True)
    pdf.cell(200, 10, txt=f"  Prediction: {prediction}", ln=True)
    pdf.cell(200, 10, txt="  Confidence Scores:", ln=True)
    pdf.cell(200, 10, txt=f"    Real: {confidences['real']:.2f}", ln=True)
    pdf.cell(200, 10, txt=f"    Fake: {confidences['fake']:.2f}", ln=True)
    pdf.cell(200, 10, txt="  Nature of Manipulation: N/A", ln=True)
    pdf.ln(10)

    # Ethical Considerations
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="8. Ethical Considerations", ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, txt="Discussed privacy concerns and compliance with legal guidelines related to data usage.")
    pdf.ln(10)

    # Limitations
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="9. Limitations", ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, txt="Acknowledge any limitations of the detection process or model performance.")
    pdf.ln(10)

    # Conclusion
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(200, 10, txt="10. Conclusion", ln=True)
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, txt=f"This report concludes that the detected image is classified as {prediction} with a confidence score of {confidences[prediction]:.2f}.")
    pdf.multi_cell(0, 10, txt="The Grad-CAM visualization indicates key features highlighted in the detection process.")
    pdf.ln(10)

    # Save PDF
    pdf_file_path = os.path.join(reports_folder, f"deepfake_detection_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
    pdf.output(pdf_file_path)

    return pdf_file_path


def main():
    st.title("DeepTracer-Advanced Deepfake Detection")
    
    # Create 'temp' directory if it doesn't exist
    if not os.path.exists("temp"):
        os.makedirs("temp")
    
    uploaded_file = st.file_uploader("Upload an Image or Video", type=["jpg", "jpeg", "png", "mp4", "avi", "mov"])
    
    if uploaded_file:
        file_path = os.path.join("temp", uploaded_file.name)
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        file_extension = uploaded_file.name.split('.')[-1].lower()

        # Set fixed width and height for displaying images
        fixed_size = (400, 400)  # Change this tuple as needed (width, height)

        # Check if it's an image
        if file_extension in ["jpg", "jpeg", "png"]:
            image = Image.open(file_path).convert('RGB')
            image = image.resize(fixed_size)  # Resize original image
            confidences, prediction, face_with_mask = predict(image)

            if prediction == "No face detected":
                st.warning("No face detected in the image. Please upload an image with a visible face.")
            else:
                # Create two columns for side-by-side display
                col1, col2 = st.columns(2)
                with col1:
                    st.image(image, caption=f"Prediction: {prediction}", use_column_width=True)

                if prediction == "fake":
                    # Resize and display Grad-CAM result
                    face_with_mask_resized = Image.fromarray(face_with_mask).resize(fixed_size)

                    with col2:
                        st.image(face_with_mask_resized, caption="Grad-CAM Visualization", use_column_width=True)

                    # Generate PDF Report button
                    if st.button("Generate PDF Report"):
                        gradcam_image_path = "temp_gradcam_image.png"
                        face_with_mask_resized.save(gradcam_image_path)  # Save resized Grad-CAM image
                        processing_time = 1.23  # Example value, replace with actual processing time
                        latency = 100  # Example value, replace with actual latency
                        pdf_path = generate_pdf(file_path, gradcam_image_path, prediction, confidences, uploaded_file.name, processing_time, latency)
                        st.success("PDF report generated successfully!")
                        with open(pdf_path, "rb") as f:
                            pdf_bytes = f.read()
                        st.download_button(label="Download Report", data=pdf_bytes, file_name=os.path.basename(pdf_path), mime='application/pdf')


        # Check if it's a video
        elif file_extension in ["mp4", "avi", "mov"]:
            frames = frames_from_video_file(file_path, n_frames=1)  # Get one frame for analysis
            image = Image.fromarray(frames[0]).convert('RGB')
            image = image.resize(fixed_size)  # Resize original image
            confidences, prediction, face_with_mask = predict(image)

            # Create two columns for side-by-side display
            col1, col2 = st.columns(2)
            with col1:
                st.image(image, use_column_width=True)
                st.markdown(f"<h2 style='text-align: center;'>Prediction: {prediction}</h2>", unsafe_allow_html=True) 

            if prediction == "fake":
                # Resize and display Grad-CAM result
                face_with_mask_resized = Image.fromarray(face_with_mask).resize(fixed_size)

                with col2:
                    st.image(face_with_mask_resized, use_column_width=True)
                    st.text("Grad-CAM Visualization")
                    

                # Generate PDF Report button
                if st.button("Generate PDF Report"):
                    gradcam_image_path = "temp_gradcam_image.png"
                    face_with_mask_resized.save(gradcam_image_path)  # Save resized Grad-CAM image
                    processing_time = 1.23  # Example value, replace with actual processing time
                    latency = 100  # Example value, replace with actual latency
                    pdf_path = generate_pdf(file_path, gradcam_image_path, prediction, confidences, uploaded_file.name, processing_time, latency)
                    st.success("PDF report generated successfully!")
                    with open(pdf_path, "rb") as f:
                        pdf_bytes = f.read()
                    st.download_button(label="Download Report", data=pdf_bytes, file_name=os.path.basename(pdf_path), mime='application/pdf')

if __name__ == "__main__":
    main()
