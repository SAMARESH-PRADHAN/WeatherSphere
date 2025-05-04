from flask import Flask, request, jsonify
from app import app
from datetime import datetime, timedelta
from dbconfig import db
from sqlalchemy import text

# Function to fetch weather data with proper grouping
def fetch_weather_data(start_date, end_date, analysis_type):
    conn = db  # Ensure database connection
    
    # Determine Grouping Level
    date_diff = (datetime.strptime(end_date, '%Y-%m-%d') - datetime.strptime(start_date, '%Y-%m-%d')).days
    if date_diff < 90:  # Less than 3 months
        group_by = "day"
    elif 90 <= date_diff <= 240:  # 3 to 8 months (15-day interval)
        group_by = "15_day"
    else:  # More than 8 months (Monthly interval)
        group_by = "month"

    # SQL Query with Grouping Logic
    query = f"""
        SELECT 
            CASE 
                WHEN :group_by = 'day' THEN date::date
                WHEN :group_by = '15_day' THEN date_trunc('day', date) - (extract(day from date)::int % 15) * interval '1 day'
                WHEN :group_by = 'month' THEN date_trunc('month', date)
            END AS period, 
            AVG({analysis_type}) as value
        FROM weather
        WHERE date BETWEEN :start_date AND :end_date
        GROUP BY period
        ORDER BY period;
    """

    try:
        result = conn.session.execute(
            text(query), 
            {"start_date": start_date, "end_date": end_date, "group_by": group_by}
        ).fetchall()

        # Convert to list
        data = [{"date": row[0].strftime('%Y-%m-%d'), analysis_type: round(row[1], 2)} for row in result]
        return data
    except Exception as e:
        return {"error": str(e)}

# API Route to Get Weather Data
@app.route("/get_tempData", methods=["POST"])
def get_tempData():
    data = request.json  # Read JSON input
    analysis_type = data.get("analysis_type")  
    date_filter = data.get("date_filter")  

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
        data = fetch_weather_data(start_date, end_date, analysis_type)
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Data Fetch Failed", "error": str(e)})
