import requests
from requests.auth import HTTPBasicAuth
from flask import Flask, request, jsonify, Response
import ee
import datetime
from dbconfig import db
from app import app
from sqlalchemy import text
import json


# Initialize Earth Engine
ee.Initialize(project="orsacinternshipproject")





# GeoServer Credentials & WFS URL
GEOSERVER_URL = "http://localhost:8080/geoserver/weather/ows"
GEOSERVER_USER = "admin"
GEOSERVER_PASS = "geoserver"

def get_city_boundary(city):
    """Fetch city boundary polygon from GeoServer as a GeoJSON FeatureCollection."""
    wfs_url = f"{GEOSERVER_URL}?service=WFS&version=1.0.0&request=GetFeature&typeName=weather:city_boundaries&outputFormat=application/json"

    response = requests.get(wfs_url, auth=HTTPBasicAuth(GEOSERVER_USER, GEOSERVER_PASS))

    if response.status_code != 200:
        print(f"❌ Error fetching WFS data: {response.status_code}")
        return None

    geojson = response.json()

    # Extract city polygon from GeoJSON
    for feature in geojson["features"]:
        if feature["properties"]["city_name"].lower() == city.lower():  # Case-insensitive match
            geom_type = feature["geometry"]["type"]
            coordinates = feature["geometry"]["coordinates"]

            if geom_type == "MultiPolygon":
                return ee.FeatureCollection([ee.Feature(ee.Geometry.MultiPolygon(coordinates))])
            elif geom_type == "Polygon":
                return ee.FeatureCollection([ee.Feature(ee.Geometry.Polygon(coordinates))])
            else:
                print(f"❌ Unsupported geometry type: {geom_type}")
                return None

    

    print(f"❌ No matching boundary found for {city}")
    return None



@app.route('/get_rainfall', methods=['GET'])
def get_rainfall():
    try:
        city = request.args.get('city')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not city:
            return jsonify({'error': 'No city selected'})

        # Get city boundary polygon from GeoServer
        city_boundary = get_city_boundary(city)
        if not city_boundary:
            return jsonify({'error': f'No boundary found for {city}'})

        # Convert dates to Python format
        start_date_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        end_date_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d")
        days_diff = (end_date_obj - start_date_obj).days

        # Load CHIRPS Daily Rainfall Dataset
        dataset = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY') \
            .filterDate(start_date, end_date) \
            .filterBounds(city_boundary) \
            .select(['precipitation'])

        count = dataset.size().getInfo()
        print(f"✅ Number of images found: {count}")

        if count == 0:
            return jsonify({'error': 'No rainfall data found for this period.'})

        # Define grouping method based on the time range
        if days_diff <= 120:
            date_format = "YYYY-MM-dd"
        elif days_diff <= 730:
            date_format = "YYYY-MM"
        else:
            date_format = "YYYY"

        # Function to extract rainfall data using city polygon
        def extract_data(image):
            formatted_date = image.date().format(date_format)
            rainfall = image.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=city_boundary,
                scale=25000
            ).get("precipitation")

            return ee.Feature(None, {'date': formatted_date, 'rainfall': rainfall})

       # Process all images
        grouped_dataset = dataset.map(extract_data)

        # Aggregate data based on grouping
        grouped_data = grouped_dataset.reduceColumns(
            ee.Reducer.mean().group(
                groupField=0,  # Group by date format (YYYY-MM or YYYY)
                groupName="date"
            ),
            ["date", "rainfall"]
        ).getInfo()

        # ✅ Extract dates and rainfall correctly
        rainfall_data = []
        if "groups" in grouped_data:
            for g in grouped_data["groups"]:
                rainfall_data.append({
                    "date": g.get("date", "Unknown"),
                    "rainfall": round(g.get("mean", 0), 2)
                })
        


        print(f"✅ Extracted Rainfall Data: {rainfall_data[:5]}")  # Debug: Print first 5

        return jsonify({
            'city': city,
            'start_date': start_date,
            'end_date': end_date,
            'rainfall_data': rainfall_data
        })

    except Exception as e:
        print(f"❌ Error in API: {e}")
        return jsonify({'error': str(e)})


@app.route('/get_rainfall_raster', methods=['GET'])
def get_rainfall_raster():
    try:
        selected_cities = request.args.getlist('city')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not selected_cities:
            return jsonify({'error': 'No city selected'})

        print(f"Selected Cities: {selected_cities}")
        print(f"Date Range: {start_date} to {end_date}")

        city_boundaries = []
        for city in selected_cities:
            city_boundary = get_city_boundary(city)
            if city_boundary:
                city_boundaries.append(city_boundary)
            else:
                print(f"❌ Error: No boundary found for {city}")

        if not city_boundaries:
            return jsonify({'error': 'No valid city boundaries found'})

        # Merge city boundaries
        merged_boundary = city_boundaries[0]
        for boundary in city_boundaries[1:]:
            merged_boundary = merged_boundary.merge(boundary)

        print(f"✅ City boundary merged successfully.")

        # Load CHIRPS Rainfall Dataset and Clip to City Boundary
        dataset = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY') \
            .filterDate(start_date, end_date) \
            .filterBounds(merged_boundary) \
            .select('precipitation')

        count = dataset.size().getInfo()
        print(f"✅ Number of images found: {count}")

        if count == 0:
            return jsonify({'error': 'No rainfall data found for this period.'})

        # Clip the dataset to the merged boundary
        rainfall_image = dataset.max().clip(merged_boundary)
        print(f"✅ Rainfall image clipped to city boundary.")

        # Convert raster to a WMS Layer
        vis_params = {
            'min': 0,
            'max': 100,
            'palette': [
        "#313695",  # Very Low (0-10mm) - Dark Blue
        "#4575b4",  # Low (10-25mm) - Blue
        "#74add1",  # Moderate (25-50mm) - Light Blue
        "#abd9e9",  # High (50-100mm) - Cyan
        "#e0f3f8",  # Very High (100-150mm) - Light Green
        "#ffffbf",  # Heavy (150-200mm) - Yellow
        "#fee090",  # Very Heavy (200-250mm) - Orange
        "#fdae61",  # Extreme (250-300mm) - Dark Orange
        "#f46d43",  # Severe (300+ mm) - Red
        "#d73027"
    ]
        }

        map_id = rainfall_image.getMapId(vis_params)
        wms_url = map_id['tile_fetcher'].url_format
        print(f"✅ WMS URL Generated: {wms_url}")

        return jsonify({'wms_url': wms_url})

    except Exception as e:
        print(f"❌ Error in API: {e}")
        return jsonify({'error': str(e)})









@app.route('/get_temperature', methods=['GET'])
def get_temperature():
    try:
        city = request.args.get('city')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not city:
            return jsonify({'error': 'No city selected'})

        # Get city boundary polygon from GeoServer
        city_boundary = get_city_boundary(city)
        if not city_boundary:
            return jsonify({'error': f'No boundary found for {city}'})

        # Convert dates to Python format
        start_date_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        end_date_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d")
        days_diff = (end_date_obj - start_date_obj).days

        # Load MODIS Land Surface Temperature dataset
        dataset = ee.ImageCollection("MODIS/061/MOD11A1") \
            .filterDate(start_date, end_date) \
            .filterBounds(city_boundary) \
            .select("LST_Day_1km")  # Daytime land surface temperature

        count = dataset.size().getInfo()
        print(f"✅ Number of images found: {count}")

        if count == 0:
            return jsonify({'error': 'No temperature data found for this period.'})

        # Define grouping method based on the time range
        if days_diff <= 120:  # ≤ 4 months → Daily data
            date_format = "YYYY-MM-dd"
        elif days_diff <= 730:  # > 4 months & ≤ 2 years → Monthly data
            date_format = "YYYY-MM"
        else:  # > 2 years → Yearly data
            date_format = "YYYY"

        print(f"✅ Using date format: {date_format}")

        # Function to extract temperature data using city polygon
        def extract_data(image):
            formatted_date = image.date().format(date_format)
            temp = image.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=city_boundary,
                scale=25000
            ).get("LST_Day_1km")
            
            temp_celsius = ee.Algorithms.If(
                temp,
                ee.Number(temp).multiply(0.02).subtract(273.15),
                None  # If temp is missing, set it as None
            )

            return ee.Feature(None, {'date': formatted_date, 'temperature': temp_celsius})

        # Process all images
        grouped_dataset = dataset.map(extract_data)

        # Aggregate data based on grouping
        grouped_data = grouped_dataset.reduceColumns(
            ee.Reducer.mean().group(
                groupField=0,  # Group by date format (YYYY-MM or YYYY)
                groupName="date"
            ),
            ["date", "temperature"]
        ).getInfo()

        # Extract dates and temperature values
        # temperature_data = []
        # if "groups" in grouped_data:
        #     for g in grouped_data["groups"]:
        #         temperature_data.append({
        #             "date": g.get("date", "Unknown"),
        #             "temperature": round((g.get("mean", 0) * 0.02) - 273.15, 2)  # Convert MODIS LST to °C
        #         })
        temperature_data = []
        if "groups" in grouped_data:
            for g in grouped_data["groups"]:
                temp_value = g.get("mean", None)
                
                if temp_value is not None:
                    temp_celsius = round(temp_value, 2)  # Convert to Celsius properly
                else:
                    temp_celsius = 0  # Handle missing data

                temperature_data.append({
                    "date": g.get("date", "Unknown"),
                    "temperature": temp_celsius
                })
                
        # Debug: Print first 5 values
        print(f"✅ Extracted Temperature Data: {temperature_data[:5]}")

        return jsonify({
            'city': city,
            'start_date': start_date,
            'end_date': end_date,
            'temperature_data': temperature_data
        })

    except Exception as e:
        print(f"❌ Error in API: {e}")
        return jsonify({'error': str(e)})
    
    
    
    
@app.route('/get_temperature_raster', methods=['GET'])
def get_temperature_raster():
    try:
        selected_cities = request.args.getlist('city')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not selected_cities:
            return jsonify({'error': 'No city selected'})

        print(f"Selected Cities: {selected_cities}")
        print(f"Date Range: {start_date} to {end_date}")

        city_boundaries = []
        for city in selected_cities:
            city_boundary = get_city_boundary(city)
            if city_boundary:
                city_boundaries.append(city_boundary)
            else:
                print(f"❌ Error: No boundary found for {city}")

        if not city_boundaries:
            return jsonify({'error': 'No valid city boundaries found'})

        # Merge city boundaries
        merged_boundary = city_boundaries[0]
        for boundary in city_boundaries[1:]:
            merged_boundary = merged_boundary.merge(boundary)

        print(f"✅ City boundary merged successfully.")

        # Load MODIS Land Surface Temperature dataset and Clip to City Boundary
        dataset = ee.ImageCollection("MODIS/061/MOD11A1") \
            .filterDate(start_date, end_date) \
            .filterBounds(merged_boundary) \
            .select("LST_Day_1km")  # Daytime land surface temperature

        count = dataset.size().getInfo()
        print(f"✅ Number of images found: {count}")

        if count == 0:
            return jsonify({'error': 'No temperature data found for this period.'})

        # Clip the dataset to the merged boundary
# Clip the dataset to the merged boundary
        temperature_image = dataset.max().clip(merged_boundary).multiply(0.02).subtract(273.15)  # Convert Kelvin to °C
        print(f"✅ Temperature image clipped to city boundary.")

        # Convert raster to a WMS Layer
        vis_params_temp = {
            'min': 20,  # MODIS LST values are in Kelvin (273K = 0°C)
            'max': 50,  # Approx. max surface temperature
            'palette': [
                "#0d0887",  # -10°C (Deep Blue)
                "#3b4994",  # 0°C (Dark Blue)
                "#7b80b4",  # 10°C (Light Blue)
                "#b5b5d8",  # 15°C (Cyan)
                "#e6e6ff",  # 20°C (Light Green)
                "#fee08b",  # 25°C (Yellow)
                "#feb24c",  # 30°C (Orange)
                "#fd8d3c",  # 35°C (Dark Orange)
                "#fc4e2a",  # 40°C (Red)
                "#e31a1c"   # 45+°C (Dark Red)
            ]
        }

        map_id = temperature_image.getMapId(vis_params_temp)
        wms_url = map_id['tile_fetcher'].url_format
        print(f"✅ WMS URL Generated: {wms_url}")

        return jsonify({'wms_url': wms_url})

    except Exception as e:
        print(f"❌ Error in API: {e}")
        return jsonify({'error': str(e)})


@app.route('/get_districts', methods=['GET'])
def get_districts():
    conn = db
    select_query = text("""
        SELECT city_name 
        FROM city_boundaries 
        ORDER BY city_name;
    """)
    
    try:
        result = conn.session.execute(select_query).fetchall()
        districts = [row[0] for row in result]
        return jsonify({"districts": districts})
    
    except Exception as e:
        return jsonify({"message": "Error fetching districts", "error": str(e)}), 500
