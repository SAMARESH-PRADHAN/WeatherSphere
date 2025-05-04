from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from app.route import registration
from app.route import login
from app.route import userManagement
from app.route import analysis
from app.route import get_tempData
from app.route import gee_api
from app.route import foregot
from app.route import contact
from app.route import feedback
from app.route import notification
from app.route import dasbord