import os
from app import app
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.pool import NullPool

POSTGRES_URL="localhost"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="Orsac%40123"
POSTGRES_DB="weather_data"
DB_URL = 'postgresql+psycopg2://{user}:{pw}@{url}/{db}'.format(user=POSTGRES_USER,pw=POSTGRES_PASSWORD,url=POSTGRES_URL,db=POSTGRES_DB)
app.config['SQLALCHEMY_DATABASE_URI']=DB_URL
app.config['SQLALCHEMY_Track_MODIFICATIONS']=False
app.config['SQLALCHEMY_ENGINE_OPTIONS']={'poolclass':NullPool}
#app.secret_key = 'manas'
db=  SQLAlchemy(app)


