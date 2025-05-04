import bcrypt
from flask import Flask,request,jsonify, send_file, render_template, Response
from app import app
from datetime import datetime
from dbconfig import db
from sqlalchemy import text
import json


# # @app.route("/")
# # def index1():
# #   return "Hello Signup"
  
  
  
  
# @app.route("/login", methods=['POST'])
# def login():
#     conn = db
#     data = request.json
#     user_email = data.get('user_email')
#     user_password = data.get('user_password')

#     select_query = text("""SELECT user_id, user_name, user_email, user_mobile_no, role_id, user_password FROM public.user_m WHERE user_email = :user_email""")

#     try:
#         result = conn.session.execute(select_query, {'user_email': user_email}).fetchone()

#         if result is None:
#             return jsonify({"message": "Invalid email or password"}), 401
        
        
#         # Extract values
#         user_id, user_name, user_email, user_mobile_no, role_id, stored_password, is_active = result

#         # Check if account is active
#         if not is_active:
#             return jsonify({"message": "You are deactivated. Please contact Admin."}), 403


#         user_details = {
#             "user_id": result[0],
#             "user_name": result[1],
#             "user_email": result[2],
#             "user_mobile_no": result[3],
#             "role_id": result[4]
#         }

#         stored_password = result[5].tobytes() 
#         # print(f"User provided password: {user_password.encode('utf-8')}, Stored hash: {stored_password.encode('utf-8')}")
#         # print(user_details)
#         if bcrypt.checkpw(user_password.encode('utf-8'), stored_password):
#             return jsonify({"message": "Login Successful", "user_details": user_details})
#         else:
#             return jsonify({"message": "Invalid email or password"}), 401


#     except Exception as e:
#         return jsonify({"message": "Login Failed", "error": str(e)})



@app.route("/login", methods=['POST'])
def login():
    conn = db
    data = request.json
    user_email = data.get('user_email')
    user_password = data.get('user_password')

    # Add is_active to the select query
    select_query = text("""
        SELECT user_id, user_name, user_email, user_mobile_no, role_id, user_password, is_active 
        FROM public.user_m 
        WHERE user_email = :user_email
    """)

    try:
        result = conn.session.execute(select_query, {'user_email': user_email}).fetchone()

        if result is None:
            return jsonify({"message": "Invalid email or password"}), 401

        # Unpack the result
        user_id, user_name, user_email, user_mobile_no, role_id, stored_password, is_active = result

        # Check if user is deactivated
        if not is_active:
            return jsonify({"message": "You are deactivated. Please contact Admin."}), 403

        # Check password
        if bcrypt.checkpw(user_password.encode('utf-8'), stored_password.tobytes()):
            user_details = {
                "user_id": user_id,
                "user_name": user_name,
                "user_email": user_email,
                "user_mobile_no": user_mobile_no,
                "role_id": role_id
            }
            return jsonify({"message": "Login Successful", "user_details": user_details})
        else:
            return jsonify({"message": "Invalid email or password"}), 401

    except Exception as e:
        return jsonify({"message": "Login Failed", "error": str(e)}), 500
