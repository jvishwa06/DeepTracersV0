from deeptracer import DeepFakeDetector
detector = DeepFakeDetector()
image = detector.predict_image('D:\\DeepTracers\\Datathon-Datasets\\IMAGE\\FAKE\\683.jpeg'); print(image)
video = detector.predict_video('D:\\DeepTracers\\Datathon-Datasets\\VIDEO\\FAKE\\id20_id9_0007.mp4'); print(video)
