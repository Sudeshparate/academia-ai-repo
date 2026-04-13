# backend/app.py
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import psycopg2
import logging
from psycopg2.extras import RealDictCursor
from models.video_summarization import summarize_video, get_progress
from models.text_to_speech import text_to_pod, get_progress as get_podcast_progress
from models.quiz_generation import generate_quiz_from_pdf
from models.content_management import save_content, get_user_content
from models.login import init_login_routes
from models.signup import init_signup_routes
from config import DB_CONFIG
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
# Configure CORS to allow specific origins
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://192.168.191.40:3000"]}})
app.config['SECRET_KEY'] = 'your-secret-key'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure uploads folder exists
UPLOAD_FOLDER = 'Uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize routes

init_login_routes(app)
init_signup_routes(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Welcome to Academia AI API',
        'version': '1.0.0',
        'endpoints': [
            '/api/video-summarize',
            '/api/text-to-podcast',
            '/api/content/<user_id>',
            '/api/videos'
            '/api/login',
            '/api/signup',
            '/api/google-login'
        ]
    })

# Database connection
def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# Video Summarization Endpoint
@app.route('/api/video-summarize', methods=['POST'])
def video_summarize():
    if 'file' not in request.files:
        print('No file in request')
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if file.filename == '':
        print('Empty filename')
        return jsonify({'error': 'No file selected'}), 400
    if file and file.filename.endswith(('.mp4', '.avi', '.mov')):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        print(f'File saved to {file_path}')
        try:
            summary = summarize_video(file_path)
            return jsonify({'summary': summary, 'video_path': f'http://localhost:5000/{file_path}'})
        except Exception as e:
            print(f'Summarization error: {str(e)}')
            return jsonify({'error': 'Failed to summarize video'}), 500
    print('Invalid file type')
    return jsonify({'error': 'Invalid file type. Please upload MP4, AVI, or MOV'}), 400

@app.route('/api/summarization-progress', methods=['GET'])
def summarization_progress():
    progress = get_progress()
    return jsonify(progress)

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

# Create table for podcast history if not exists
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS podcast_history (
            id SERIAL PRIMARY KEY,
            pdf_path VARCHAR(255),
            audio_path VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

init_db()

# New podcast generation endpoint
@app.route('/api/generate-podcast', methods=['POST'])
def generate_podcast_endpoint():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file provided'}), 400
    pdf = request.files['pdf']
    if not pdf.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Invalid file type. Please upload a PDF'}), 400
    pdf_path = os.path.join('Uploads', pdf.filename)
    os.makedirs('Uploads', exist_ok=True)
    pdf.save(pdf_path)
    output_audio_path = os.path.join('Uploads', f"podcast_{pdf.filename}.mp3")
    try:
        audio_path = text_to_pod(pdf_path, output_audio_path)
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO podcast_history (pdf_path, audio_path) VALUES (%s, %s)",
            (pdf_path, audio_path)
        )
        conn.commit()
        cur.close()
        conn.close()
        return send_file(audio_path, as_attachment=True, download_name=f"podcast_{pdf.filename}.mp3")
    except Exception as e:
        logger.error(f"Podcast generation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/podcast-progress', methods=['GET'])
def podcast_progress():
    return jsonify(get_podcast_progress())


@app.route('/api/quiz-generate', methods=['POST'])
def generate_quiz():
    if 'file' not in request.files:
        return jsonify({'message': 'No PDF uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '' or not file.filename.endswith('.pdf'):
        return jsonify({'message': 'Invalid file. Please upload a PDF'}), 400

    try:
        # Save PDF temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(temp_path)

        # Generate quiz from PDF
        quiz_data = generate_quiz_from_pdf(temp_path)

        # Store in database
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Insert into Quiztable
        cur.execute(
            'INSERT INTO Quiztable (Q_title, Q_Content) VALUES (%s, %s) RETURNING Quiz_id',
            (quiz_data['title'], quiz_data['content'])
        )
        quiz_id = cur.fetchone()['quiz_id']

        # Insert questions and options
        for question in quiz_data['questions']:
            cur.execute(
                'INSERT INTO Questions (Quiz_id, Que_text) VALUES (%s, %s) RETURNING Que_id',
                (quiz_id, question['text'])
            )
            question_id = cur.fetchone()['que_id']

            for option in question['options']:
                cur.execute(
                    'INSERT INTO Options (Que_id, Opt_text, is_correct) VALUES (%s, %s, %s)',
                    (question_id, option['text'], option['is_correct'])
                )

        conn.commit()
        cur.close()
        conn.close()

        # Clean up
        os.remove(temp_path)

        return jsonify({'quizId': quiz_id, 'message': 'Quiz generated successfully'}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'message': f'Failed to generate quiz: {str(e)}'}), 500

@app.route('/api/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Fetch quiz
        cur.execute('SELECT * FROM Quiztable WHERE Quiz_id = %s', (quiz_id,))
        quiz = cur.fetchone()
        if not quiz:
            cur.close()
            conn.close()
            return jsonify({'message': 'Quiz not found'}), 404

        # Fetch questions
        cur.execute('SELECT * FROM Questions WHERE Quiz_id = %s', (quiz_id,))
        questions = cur.fetchall()

        # Fetch options
        quiz_data = {
            'title': quiz['q_title'],
            'content': quiz['q_content'],
            'questions': []
        }

        for question in questions:
            cur.execute('SELECT * FROM Options WHERE Que_id = %s', (question['que_id'],))
            options = cur.fetchall()
            quiz_data['questions'].append({
                'text': question['que_text'],
                'options': [{'text': opt['opt_text'], 'isCorrect': opt['is_correct']} for opt in options]
            })

        cur.close()
        conn.close()
        return jsonify(quiz_data), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'message': f'Failed to fetch quiz: {str(e)}'}), 500

@app.route('/api/quiz-progress', methods=['GET'])
def quiz_progress():
    # Mock progress (replace with actual logic if needed)
    return jsonify({'percentage': 50, 'status': 'processing'}), 200

# Content Management Endpoints
@app.route('/api/content', methods=['POST'])
def save_user_content():
    data = request.json
    user_id = data['user_id']
    content_type = data['content_type']
    content_path = data['content_path']
    save_content(user_id, content_type, content_path)
    return jsonify({'message': 'Content saved'})

@app.route('/api/content/<user_id>', methods=['GET'])
def fetch_user_content(user_id):
    content = get_user_content(user_id)
    return jsonify({'content': content})

"""# Login Endpoint (Placeholder)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']
    # Implement authentication logic
    return jsonify({'message': 'Login successful', 'user_id': 1})"""

if __name__ == '__main__':
    app.run(debug=True, port=5000)