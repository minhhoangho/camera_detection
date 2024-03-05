import sys
sys.path.append("./")
import os
from flask import Flask, render_template, Response
import cv2
import time
from flask_sse import sse
from pytube import YouTube
from flask_cors import CORS
from detection_util import DetectionUtil
from vidgear.gears import CamGear

app = Flask(__name__)
CORS(app)
app.config["REDIS_URL"] = "redis://localhost:6379"
app.register_blueprint(sse, url_prefix='/api/sse')
detector = DetectionUtil(os.path.join("./models", "yolov8m.pt"))


stream = CamGear(source='https://youtu.be/dQw4w9WgXcQ', stream_mode = True, logging=True).start() # YouTube Video URL as input

def generate_frames(video_id="nefxDbLywEI"):
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    # yt = YouTube(video_url)
    # stream = yt.streams.get_highest_resolution()
    # cap = cv2.VideoCapture(stream.url)

    cap = CamGear(source=video_url, stream_mode = True, logging=True).start() # YouTube Video URL as input

    # Define the desired frame rate (frames per second)
    frame_rate = 90
    # Calculate the delay between frames
    delay = 1 / frame_rate
    while True:
        frame = cap.read()

        # if not ret:
        #     break

        frame, results = detector.predict_obj(frame=frame)
        with app.app_context():
            sse.publish({"objects": detector.count_objects(results)}, type='video_tracking')
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/api/stream/video')
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    app.run(debug=True, port=3000)
