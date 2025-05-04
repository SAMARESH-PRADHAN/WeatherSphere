import bcrypt
from app import app
from flask import Flask,request,jsonify,send_file, render_template,Response
from datetime import datetime
from dbconfig import db
from sqlalchemy import text


@app.route("/")
def index1():
  return "Hello Regestrion"

@app.route("/registration", methods=['POST'])
def registration():
    conn = db
    data = request.json
    user_name = data.get('user_name')
    user_email = data.get('user_email')
    user_mobile_no = data.get('user_mobile_no')
    user_password = data.get('user_password') 
    role_id = 1# Corrected typo

    # hashed_password = bcrypt.hashpw(user_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    hashed_password = bcrypt.hashpw(user_password.encode('utf-8'), bcrypt.gensalt())
    
    insert_query = text("""INSERT INTO public.user_m (user_name, user_email, user_mobile_no, role_id, user_password) 
                          VALUES (:user_name, :user_email, :user_mobile_no, :role_id, :user_password)""")
    
    try:
        conn.session.execute(insert_query, {'user_name': user_name, 'user_email': user_email, 'user_mobile_no' :user_mobile_no ,'role_id':role_id, 'user_password': hashed_password})
        conn.session.commit()
        return jsonify({"message": "Register Successfully"})  # Return a dictionary instead of a set
    except Exception as e:
        # Rollback the session in case of an error
        conn.session.rollback()
        return jsonify({"message": "Register Unsuccessful"})