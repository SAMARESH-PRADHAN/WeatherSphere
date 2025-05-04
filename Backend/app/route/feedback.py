from app import app
from flask import Flask,request,jsonify,send_file, render_template,Response
from datetime import datetime
from dbconfig import db
from sqlalchemy import text

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    conn = db  # Same as your registration API
    data = request.json
    feedback_text = data.get('feedback', '').strip()
    rating = int(data.get('rating', 0))
    improvement_text = data.get('improvement', '').strip()
    user_id = int(data.get('user_id', 0))

    if not feedback_text or rating < 1 or rating > 5:
        return jsonify({"status": "error", "message": "Invalid feedback or rating"}), 400

    insert_query = text("""
        INSERT INTO feedback_m (rating, feedback, improvement, submitted_at, user_id)
        VALUES (:rating, :feedback, :improvement, :submitted_at, :user_id)
    """)

    try:
        conn.session.execute(insert_query, {
            'rating': rating,
            'feedback': feedback_text,
            'improvement': improvement_text,
            'submitted_at': datetime.now(),
            'user_id': user_id
        })
        conn.session.commit()
        return jsonify({"status": "success", "message": "Feedback submitted successfully!"}), 200
    except Exception as e:
        conn.session.rollback()
        return jsonify({"status": "error", "message": "Submission failed!"}), 500