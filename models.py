"""
This file defines the database models
"""
from py4web import URL
import datetime
from operator import getitem
import string
from tokenize import Double

from .common import db, Field, auth
from pydal.validators import *

MAX_CACHES = 1000000

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()

# User Table
db.define_table(
    "users",
        Field("first_name", "string"),
        Field("last_name", "string"),
        Field("user_email", "string"),
        Field("creation_date", "datetime"),
        Field("banner_path", "string"),
        Field("profile_photo_path", "string"),
        Field("caches_logged", "integer"),
        Field("caches_hidden", "integer"),
)

# User Table Field Requirements
db.users.first_name.requires = IS_NOT_EMPTY
db.users.last_name.requires = IS_NOT_EMPTY
db.users.user_email.requires = IS_EMAIL
db.users.creation_date.requires = IS_DATE
db.users.banner_path.requires = IS_NOT_EMPTY
db.users.profile_photo_path.requires = IS_NOT_EMPTY
db.users.banner_path.requires = IS_NOT_EMPTY
db.users.caches_logged.requires = IS_INT_IN_RANGE(0,MAX_CACHES)
db.users.caches_hidden.requires = IS_INT_IN_RANGE(0,MAX_CACHES)

# User Table Defaults
db.users.user_email.default = get_user_email
db.users.creation_date.default = get_time
db.users.banner_path.default = URL("static","images", "DefaultBanner.jpg")
db.users.profile_photo_path.default = URL("static","images", "DefaultProfilePic.jpg")
db.users.caches_logged.default = 0
db.users.caches_hidden.default = 0

# User Table Field Labels
db.users.first_name.label = "First Name"
db.users.last_name.label = "Last Name"
db.users.user_email.label = "Email"
db.users.creation_date.label = "Creation Date"
db.users.caches_logged.label = "Caches Logged"
db.users.caches_hidden.label = "Caches Hidden"

# User Table Fields Readable/Writeable edits
db.users.user_email.readable = db.users.user_email.writeable = False
db.users.creation_date.readable = db.users.creation_date.writeable = False

# ----------------------------------------------------
# Cache Table
db.define_table(
    "caches",
        Field("cache_name", "string"),
        Field("photo_path", "string"),
        Field("lat", "float"),
        Field("long", "float"),
        Field("description", "string"),
        Field("hint", "string"),
        Field("author", "reference users"),
        Field("creation_date", "datetime"),
)

# Cache Table Field Requirements
db.caches.cache_name.requires = IS_NOT_EMPTY
db.caches.lat.requires = IS_FLOAT_IN_RANGE(-90, 90, error_message="Please enter a valid lattitude.")
db.caches.long.requires = IS_FLOAT_IN_RANGE(-180, 180, error_message="Please enter a valid longitude.")
db.caches.description.requires = IS_NOT_EMPTY
db.caches.creation_date.requires = IS_DATE

# Cache Table Field defaults
db.caches.author.default = get_user_email
db.caches.creation_date.default = get_time

# Cache Table Field labels
db.caches.cache_name.label = "Name"
db.caches.lat.label = "Lattitude"
db.caches.long.label = "Longitude"
db.caches.description.label = "Description"
db.caches.hint.label = "Hint"
db.caches.creation_date.label = "Creation Date"

# Cache Table Fields Readable/Writeable edits
db.caches.author.readable = db.caches.author.writeable = False
db.caches.author.writeable = False

# ----------------------------------------------------


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.commit()
