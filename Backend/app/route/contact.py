import bcrypt
from app import app
from flask import Flask,request,jsonify,send_file, render_template,Response
from datetime import datetime
from dbconfig import db
from sqlalchemy import text


@app.route('/submitContact', methods=['POST'])
def submitContact():
  conn = db
  data = request.json
  c_name = data.get("c_name")
  c_email = data.get("c_email")
  c_subject = data.get("c_subject")
  c_message = data.get("c_message")
  
  
  if not c_name or not c_email or not c_subject or not c_message:
    return jsonify({"message": "All fields are required!"}), 400
  
  
  insert_query = text("""INSERT INTO contact_table (c_name, c_email, c_subject, c_message) VALUES (:c_name, :c_email, :c_subject, :c_message)""")
  
  try:
    conn.session.execute(insert_query, {
      'c_name': c_name,
      'c_email': c_email,
      'c_subject': c_subject,
      'c_message': c_message
    })
    conn.session.commit()
    return jsonify({"message": "Send Successfully"})
  except Exception as e:
    conn.session.rollback()
    return jsonify({"message": "Load Unsuccessful"})