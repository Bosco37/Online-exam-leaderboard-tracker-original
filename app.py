from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import pymysql

# This allows SQLAlchemy to connect to MySQL using pymysql
pymysql.install_as_MySQLdb()

app = Flask(__name__)

# Configure SQLite Database Connection (no external server needed)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///leaderboard.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the Score Model (matches our SQL table)
class Score(db.Model):
    __tablename__ = 'scores'
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    exam_name = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    exam_date = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'student_name': self.student_name,
            'exam_name': self.exam_name,
            'score': self.score,
            'exam_date': self.exam_date.strftime('%b %d, %Y') if self.exam_date else 'N/A'
        }

@app.route('/')
def index():
    # Render the main HTML frontend
    return render_template('index.html')

@app.route('/api/scores', methods=['GET'])
def get_scores():
    # Fetch all scores from database, order by highest score first
    try:
        scores = Score.query.order_by(Score.score.desc()).all()
        return jsonify([score.to_dict() for score in scores])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scores', methods=['POST'])
def add_score():
    # Get JSON data from frontend request
    data = request.json
    student_name = data.get('student_name')
    exam_name = data.get('exam_name')
    score_val = data.get('score')

    # Basic Validation
    if not student_name or not exam_name or score_val is None:
        return jsonify({'error': 'Please fill all required fields.'}), 400

    try:
        # Create a new record and save it to the database
        new_score = Score(student_name=student_name, exam_name=exam_name, score=score_val)
        db.session.add(new_score)
        db.session.commit()
        return jsonify({'message': 'Score added successfully!', 'score': new_score.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Initialize the database and add dummy data if empty
with app.app_context():
    db.create_all()
    try:
        if not Score.query.first():
            dummy_scores = [
                Score(student_name='Alice Smith', exam_name='Python Basics', score=95),
                Score(student_name='Bob Johnson', exam_name='Computer Networks', score=88),
                Score(student_name='Charlie Brown', exam_name='Data Structures', score=92)
            ]
            db.session.add_all(dummy_scores)
            db.session.commit()
            print("Initialized SQLite database with dummy data.")
    except Exception as e:
        print(f"Database already initialized or error: {e}")

if __name__ == '__main__':
    # Starts the Flask Web Server
    print("Starting Flask Server...")
    app.run(debug=True, port=5000)
