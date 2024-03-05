from flask import Flask, render_template, Response
import cv2
import time

from pytube import YouTube

from main import predict_obj, init_model

app = Flask(__name__)
model = init_model()


def generate_frames(video_id="_HcPxEE8OFE"):
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    yt = YouTube(video_url)
    stream = yt.streams.get_highest_resolution()
    cap = cv2.VideoCapture(stream.url)
    # Define the desired frame rate (frames per second)
    frame_rate = 90
    # Calculate the delay between frames
    delay = 1 / frame_rate
    while True:
        ret, frame = cap.read()

        if not ret:
            break

        frame = predict_obj(model=model, frame=frame)
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/api/stream/video')
def video():
    print("Hehee")
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    app.run(debug=True, port=3000)
