from flask import jsonify,Flask, request
from sqlalchemy import text
from app import app
from dbconfig import db
from datetime import datetime
from psycopg2.extras import RealDictCursor
import psycopg2

@app.route("/get_contact", methods=["GET"])
def get_contact():
    try:
        start = request.args.get("start")
        end = request.args.get("end")
        
        query = """SELECT contact_id, c_name, c_email, c_subject, c_message, created_on, status
                   FROM contact_table"""
        
        if start and end:
            query += " WHERE created_on BETWEEN :start AND :end"
            result = db.session.execute(text(query), {"start": start, "end": end})
        else:
            result = db.session.execute(text(query))
        
        output = []
        for row in result:
            output.append({
                "contact_id": row.contact_id,
                "c_name": row.c_name,
                "c_email": row.c_email,
                "c_subject": row.c_subject,
                "c_message": row.c_message,
                "created_on": row.created_on.strftime('%Y-%m-%d %H:%M:%S'),
                "status":row.status
            })
        return jsonify(output)
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/get_feedback", methods=["GET"])
def get_feedback():
    try:
        query = """
            SELECT f.feedback, f.rating, f.submitted_at, f.improvement, u.user_name
            FROM feedback_m f
            JOIN user_m u ON f.user_id = u.user_id
        """
        result = db.session.execute(text(query))

        output = []
        for row in result:
            output.append({
                "feedback": row.feedback,
                "rating": row.rating,
                "submitted_at": row.submitted_at.strftime('%Y-%m-%d %H:%M:%S'),
                "improvement": row.improvement,
                "user_name": row.user_name
            })
        return jsonify(output)
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/mark-contact-read/<int:contact_id>', methods=['POST'])
def mark_contact_read(contact_id):
    try:
        query = text("UPDATE contact_table SET status = 'replied' WHERE contact_id = :contact_id")
        db.session.execute(query, {"contact_id": contact_id})
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500