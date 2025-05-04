# 🌦️ WeatherSphere

**WeatherSphere** is a complete weather intelligence hub that provides real-time weather updates, 5-day forecasts, weather news, interactive maps, and historical analysis powered by satellite data from Google Earth Engine.

---

## 🔥 Features

- 🌍 Real-time weather updates by city
- 📅 5-day weather forecasts
- 📰 Latest weather news in card format
- 🗺️ Interactive map showing live & forecasted weather
- 📊 Historical temperature & rainfall charts
- 🛰️ Satellite data integration (Google Earth Engine)
- 📥 Download weather data as CSV & image
- ✉️ Feedback and contact system with filtering, sorting & modal views
- 🔐 Forgot password with OTP verification via email
- 🧑‍💼 Admin dashboard with:
  - 👥 User management (activate/deactivate)
  - ⭐ Feedback trends & statistics
  - 📨 Contact message tracking (read/unread)

---

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, Bootstrap, JavaScript, jQuery
- **Backend**: Python Flask
- **Database**: PostgreSQL
- **Satellite Data**: Google Earth Engine (GEE)
- **Charting Library**: Chart.js

---

## 📸 Screenshots

### 🏠 Landing Page

![Landing Page](Screenshot/landing.png)

### 🏡 Home Page

![Home Page](Screenshot/home.png)

### 📈 Historical Analysis (Temperature/Rainfall)

![Analysis](Screenshot/Analysis.png)

### 🗺️ Weather Map

![Weather Map](Screenshot/map.png)

### 📰 Weather News

![News](Screenshot/News.png)

### 💬 Feedback Form

![Feedback](Screenshot/feedback.png)

### 🧑‍💼 Admin Dashboard Overview

![Dashboard](Screenshot/dashbord.png)

### 👥 User Management

![User Management](Screenshot/usermanagement.png)

### 🔔 Notifications (Feedback & Contact)

![Notifications](Screenshot/Notification.png)

---

## 🔐 Forgot Password Feature

- Users can reset their password via OTP sent to their registered email.
- Secure validation ensures only verified users can change their password.

---

## 🚀 Getting Started

Follow these steps to set up and run the WeatherSphere project locally:

### 🔹 1. Clone the Repository

```bash
git clone https://github.com/SAMARESH-PRADHAN/WeatherSphere.git
cd WeatherSphere
```

###🔹 2. Create a Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate # On Windows
```

# OR

```bash
source venv/bin/activate # On macOS/Linux
```

###🔹 3. Install Dependencies

```bash
pip install -r requirements.txt
```

###🔹 4. Set Up the .env File

```bash
Create a .env file in the root folder and add your database and secret config:
```

```ini
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
SECRET_KEY=your_secret_key
✅ Note: Make sure .env is listed in your .gitignore file to prevent it from being pushed to GitHub.
```

###🔹 5. Run the Application

```bash
flask run
The app will run at: http://127.0.0.1:5000
```

---

## 👤 Author

- **Samaresh Pradhan**
  GitHub: [@SAMARESH-PRADHAN](https://github.com/SAMARESH-PRADHAN)

---

## 📬 Contact

📧 Email: pradhansamaresh2002@gmail.com
📱 Mobile: +91-7978961272

---
