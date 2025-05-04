from flask import Flask, request, jsonify
from app import app
from datetime import datetime, timedelta
from dbconfig import db
from sqlalchemy import text

def fetch_weather_data(start_date, end_date, analysis_type, group_by):
    conn = db  # Use SQLAlchemy connection

    if group_by == "daily":
        query = text(f"""
            SELECT date, {analysis_type} 
            FROM weather 
            WHERE date BETWEEN :start_date AND :end_date
            ORDER BY date ASC
        """)
    elif group_by == "15_days":
        query = text(f"""
            SELECT 
                DATE_TRUNC('day', date) + INTERVAL '15 days' * floor(EXTRACT(DAY FROM date) / 15) AS period,
                AVG({analysis_type}) AS {analysis_type}
            FROM weather 
            WHERE date BETWEEN :start_date AND :end_date
            GROUP BY period
            ORDER BY period ASC
        """)
    else:  # Monthly grouping
        query = text(f"""
            SELECT 
                DATE_TRUNC('month', date) AS period,
                AVG({analysis_type}) AS {analysis_type}
            FROM weather 
            WHERE date BETWEEN :start_date AND :end_date
            GROUP BY period
            ORDER BY period ASC
        """)

    try:
        result = conn.session.execute(query, {"start_date": start_date, "end_date": end_date}).fetchall()
        return [{"date": row[0].strftime('%Y-%m-%d'), analysis_type: row[1]} for row in result]
    except Exception as e:
        return {"error": str(e)}

@app.route("/get_weather_data", methods=["POST"])
def get_weather_data():
    conn = db
    data = request.json

    date_filter = data.get("date_filter")
    analysis_type = data.get("analysis_type")
    group_by = data.get("group_by", "daily")
    
    end_date = datetime.today().strftime('%Y-%m-%d')
    
    if date_filter == "custom":
        start_date = data.get("start_date")
        end_date = data.get("end_date")
    else:
        time_deltas = {
            "1_month": 30,
            "3_months": 90,
            "6_months": 180,
            "1_year": 365,
            "2_years": 730
        }
        start_date = (datetime.today() - timedelta(days=time_deltas[date_filter])).strftime('%Y-%m-%d')

    try:
        data = fetch_weather_data(start_date, end_date, analysis_type, group_by)
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Data Fetch Failed", "error": str(e)})
