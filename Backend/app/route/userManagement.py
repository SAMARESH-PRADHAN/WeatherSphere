from flask import Flask, request, jsonify
from app import app
from sqlalchemy import text
from dbconfig import db
import bcrypt

# Route to get all users
@app.route('/users', methods=['GET'])
def get_users():
    try:
        sql = text("SELECT user_id, user_name, user_email, user_mobile_no, is_active, created_at FROM public.user_m")
        result = db.session.execute(sql)
        users = [{ 'user_id': row.user_id, 'user_name': row.user_name, 'user_email': row.user_email, 'user_mobile_no': row.user_mobile_no, 'is_active': row.is_active, 'created_at': row.created_at } for row in result]
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching users', 'error': str(e)}), 500

# Route to add a user
@app.route('/users', methods=['POST'])
def add_user():
    data = request.json
    role_id = 2
    # hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    hashed_password = bcrypt.hashpw(data['user_password'].encode('utf-8'), bcrypt.gensalt())
    sql = text("""
        INSERT INTO public.user_m (user_name, user_email, user_mobile_no, role_id, user_password)
        VALUES (:user_name, :user_email, :user_mobile_no, :role_id, :user_password)
    """)
    try:
        db.session.execute(sql, {
            'user_name': data['user_name'], 'user_email': data['user_email'],
            'user_mobile_no': data['user_mobile_no'], 'role_id': role_id, 'user_password': hashed_password})
        db.session.commit()
        return jsonify({'message': 'User added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error adding user', 'error': str(e)}), 500

# Route to update a user
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    sql = text("""
        UPDATE public.user_m SET user_name = :user_name, user_email = :user_email, user_mobile_no = :user_mobile_no WHERE user_id = :user_id
    """)
    try:
        result = db.session.execute(sql, {
            'user_id': user_id, 'user_name': data['user_name'], 'user_email': data['user_email'], 'user_mobile_no': data['user_mobile_no']
        })
        if result.rowcount == 0:
            return jsonify({'message': 'User not found'}), 404
        db.session.commit()
        return jsonify({'message': 'User updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating user', 'error': str(e)}), 500

# Route to delete a user
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    sql = text("DELETE FROM public.user_m WHERE user_id = :user_id")
    try:
        result = db.session.execute(sql, {'user_id': user_id})
        if result.rowcount == 0:
            return jsonify({'message': 'User not found'}), 404
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting user', 'error': str(e)}), 500



@app.route('/users/<int:user_id>/status', methods=['PATCH'])
def toggle_user_status(user_id):
    data = request.json
    new_status = data.get('is_active')  # should be True or False (boolean)

    sql = text("UPDATE public.user_m SET is_active = :status WHERE user_id = :user_id")
    try:
        result = db.session.execute(sql, {'status': new_status, 'user_id': user_id})
        if result.rowcount == 0:
            return jsonify({'message': 'User not found'}), 404
        db.session.commit()
        action = "activated" if new_status else "deactivated"
        return jsonify({'message': f'User {action} successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error changing user status', 'error': str(e)}), 500


