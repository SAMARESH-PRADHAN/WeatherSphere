from flask import Flask, jsonify, request
from app import app
from dbconfig import db
from sqlalchemy import text

@app.route("/dashboard-stats", methods=['GET'])
def dashboard_stats():
    try:
        total_users = db.session.execute(text("SELECT COUNT(*) FROM public.user_m")).scalar()
        total_cities = db.session.execute(text("SELECT COUNT(*) FROM public.city_boundaries")).scalar()
        total_feedbacks = db.session.execute(text("SELECT COUNT(*) FROM public.feedback_m")).scalar()
        unread_contacts = db.session.execute(text("SELECT COUNT(*) FROM public.contact_table WHERE status='unread'")).scalar()
        return jsonify({
            "total_users": total_users,
            "total_cities": total_cities,
            "total_feedbacks": total_feedbacks,
            "unread_contacts": unread_contacts
        })
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/feedback-chart-data", methods=['GET'])
def feedback_chart_data():
    try:
        sql = """
        SELECT rating, COUNT(*) as count 
        FROM public.feedback_m 
        GROUP BY rating 
        ORDER BY rating
        """
        result = db.session.execute(text(sql))
        chart_data = [0, 0, 0, 0, 0]
        for row in result:
            chart_data[row.rating - 1] = row.count
        return jsonify(chart_data)
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/user-chart-data", methods=['GET'])
def user_chart_data():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    try:
        sql = """
        SELECT to_char(created_at, 'YYYY-MM-DD') as date, COUNT(*) as count 
        FROM public.user_m
        WHERE 1=1
        """
        if start_date and end_date:
            sql += " AND created_at::date BETWEEN :start AND :end"
            result = db.session.execute(text(sql + " GROUP BY date ORDER BY date"),
                                        {"start": start_date, "end": end_date})
        else:
            result = db.session.execute(text(sql + " GROUP BY date ORDER BY date"))
        data = [{"date": row.date, "count": row.count} for row in result]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)})

