import streamlit as st
from gradio_client import Client, handle_file

# Gradio client setup
client = Client("JVishu/DeepTracer_Audio")

# Streamlit UI
st.title("Deepfake Audio Detection")

# Upload audio file
uploaded_file = st.file_uploader("Upload an audio file", type=["wav", "mp3"])

if uploaded_file is not None:
    # Save the uploaded file locally as temp_audio.wav
    with open("temp_audio.wav", "wb") as f:
        f.write(uploaded_file.getbuffer())

    # Play the uploaded audio file
    st.audio(uploaded_file, format="audio/wav")

    if st.button("Analyze Audio"):
        # Make a prediction using the Gradio client
        with st.spinner("Analyzing the audio file..."):
            try:
                # Use handle_file() to send the file, similar to your working standalone script
                result = client.predict(
                    input_audio=handle_file('temp_audio.wav'),
                    api_name="/predict"
                )
                st.success("Analysis complete!")
                st.write(result)  # Display the result as a string

            except Exception as e:
                # Display the error message if something goes wrong
                st.error(f"An error occurred while analyzing the audio: {str(e)}")
