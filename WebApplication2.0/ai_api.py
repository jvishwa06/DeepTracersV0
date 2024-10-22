import requests
import random
import time
import os

def detect_deepfake(source):
    time.sleep(2)
    
    if source.startswith(('http://', 'https://')):
        pass
    elif os.path.isfile(source):
        pass
    
    result = random.choice([
        {"is_deepfake": True, "confidence": random.uniform(0.7, 0.99)},
        {"is_deepfake": False, "confidence": random.uniform(0.7, 0.99)}
    ])
    
    return result

def get_supported_platforms():
    return ["TikTok", "X", "Facebook", "Instagram", "Reddit", "Truth Social"]
