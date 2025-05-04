import bcrypt
import random
import smtplib
from flask import Flask, request, jsonify, render_template
from dbconfig import db
from sqlalchemy import text
from email.message import EmailMessage
from app import app

# Email Configuration (Google App Password)
EMAIL_ADDRESS = "pradhansamaresh6893@gmail.com"
EMAIL_PASSWORD = "swsjzkogpbikeeja"  # Replace with your app password

otp_store = {}  # Temporary storage for OTPs

@app.route('/forgot-password')
def forgot_password_page():
    try:
        return render_template('forgot_password.html')
    except Exception as e:
        return jsonify({"message": "Error loading Forgot Password page", "error": str(e)}), 500

# **Send OTP via Email**
@app.route('/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.json
        user_email = data.get('user_email')

        if not user_email:
            return jsonify({"message": "Email is required"}), 400

        select_query = text("SELECT user_email FROM public.user_m WHERE user_email = :user_email")
        result = db.session.execute(select_query, {'user_email': user_email}).fetchone()

        if not result:
            return jsonify({"message": "Email not registered"}), 404

        otp = str(random.randint(100000, 999999))
        otp_store[user_email] = otp  # Store OTP temporarily

        try:
            msg = EmailMessage()
            msg.set_content(f"Your OTP for password reset is {otp}")
            msg['Subject'] = "Password Reset OTP"
            msg['From'] = EMAIL_ADDRESS
            msg['To'] = user_email

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                smtp.send_message(msg)

            return jsonify({"message": "OTP sent to email"}), 200
        except Exception as email_error:
            return jsonify({"message": "Error sending OTP via Email", "error": str(email_error)}), 500

    except Exception as e:
        return jsonify({"message": "An error occurred while sending OTP", "error": str(e)}), 500

# **Verify OTP**
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.json
        user_email = data.get('user_email')
        otp = data.get('otp')

        if not user_email or not otp:
            return jsonify({"message": "Email and OTP are required"}), 400

        if otp_store.get(user_email) == otp:
            del otp_store[user_email]  # Remove OTP after verification
            return jsonify({"message": "OTP verified successfully"}), 200
        else:
            return jsonify({"message": "Invalid OTP"}), 400

    except Exception as e:
        return jsonify({"message": "An error occurred while verifying OTP", "error": str(e)}), 500

# **Reset Password**
@app.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        user_email = data.get('user_email')
        new_password = data.get('new_password')

        if not user_email or not new_password:
            return jsonify({"message": "Email and new password are required"}), 400

        select_query = text("SELECT user_id FROM public.user_m WHERE user_email = :user_email")
        result = db.session.execute(select_query, {'user_email': user_email}).fetchone()

        if not result:
            return jsonify({"message": "User not found"}), 404

        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())  # Hash password

        update_query = text("UPDATE public.user_m SET user_password = :user_password WHERE user_email = :user_email")
        db.session.execute(update_query, {'user_password': hashed_password, 'user_email': user_email})
        db.session.commit()

        return jsonify({"message": "Password reset successful"}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred while resetting password", "error": str(e)}), 500
