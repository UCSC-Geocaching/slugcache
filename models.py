"""
This file defines the database models
"""
from py4web import URL
import datetime

from py4web import Field
from .common import db, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get("email") if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


# User Table
db.define_table(
    "users",
    Field("user_id", "reference auth_user"),
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
db.users.first_name.requires = IS_NOT_EMPTY(error_message="Enter a first name.")
db.users.last_name.requires = IS_NOT_EMPTY(error_message="Enter a last name.")
db.users.user_email.requires = IS_EMAIL(error_message="Enter a valid email.")
db.users.creation_date.requires = IS_DATETIME(error_message="Enter a valid date.")
db.users.banner_path.requires = IS_NOT_EMPTY()
db.users.profile_photo_path.requires = IS_NOT_EMPTY()
db.users.caches_logged.requires = IS_INT_IN_RANGE(0, None)
db.users.caches_hidden.requires = IS_INT_IN_RANGE(0, None)

# User Table Defaults
db.users.user_email.default = get_user_email
db.users.creation_date.default = get_time
db.users.banner_path.default = URL("static", "images", "default_banner.jpg")
db.users.profile_photo_path.default = URL("static", "images", "default_profile_pic.jpg")
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
    Field("difficulty", "integer"),
    Field("terrain", "integer"),
    Field("size", "integer"),
    Field("valid", "integer"),
)

# Cache Table Field Requirements
db.caches.cache_name.requires = IS_NOT_EMPTY()
db.caches.lat.requires = IS_FLOAT_IN_RANGE(
    -90, 90, error_message="Please enter a valid latitude."
)
db.caches.long.requires = IS_FLOAT_IN_RANGE(
    -180, 180, error_message="Please enter a valid longitude."
)
db.caches.description.requires = IS_NOT_EMPTY()
db.caches.creation_date.requires = IS_DATETIME()
db.caches.difficulty.requires = IS_IN_SET([1, 2, 3, 4, 5])
db.caches.terrain.requires = IS_IN_SET([1, 2, 3, 4, 5])
db.caches.size.requires = IS_IN_SET([1, 2, 3, 4, 5])

# Cache Table Field defaults
db.caches.author.default = get_user_email
db.caches.creation_date.default = get_time
db.caches.difficulty.default = 1
db.caches.terrain.default = 1
db.caches.size.default = 1
db.caches.valid.default = 0

# Cache Table Field labels
db.caches.cache_name.label = "Name"
db.caches.lat.label = "Latitude"
db.caches.long.label = "Longitude"
db.caches.description.label = "Description"
db.caches.hint.label = "Hint"
db.caches.creation_date.label = "Creation Date"
db.caches.difficulty.label = "Difficulty"
db.caches.terrain.label = "Terrain"
db.caches.size.label = "Size"
db.caches.valid.label = "Valid"

# Cache Table Fields Readable/Writeable edits
db.caches.author.readable = db.caches.author.writable = False
db.caches.author.writable = False

# ----------------------------------------------------
# Log Table
db.define_table(
    "logs",
    Field("logger", "reference users"),
    Field("cache", "reference caches"),
    Field("discover_date", "datetime"),
)

# Log Table Field Requirements
db.logs.logger.requires = IS_NOT_EMPTY(error_message="Enter a logger.")
db.logs.cache.requires = IS_NOT_EMPTY(error_message="Enter a cache.")
db.logs.discover_date.requires = IS_DATETIME(error_message="Enter a valid date.")

# Log Table Defaults
db.logs.discover_date.default = get_time

# Log Table Field Labels
db.logs.logger.label = "Logger"
db.logs.cache.label = "Cache"
db.logs.discover_date.label = "Discover Date"

# Log Table Fields Readable/Writeable edits

# ----------------------------------------------------
# Bookmarks Table
db.define_table(
    "bookmarks",
    Field("user", "reference users"),
    Field("cache", "reference caches"),
)
# Bookmarks Table Field Requirements
db.bookmarks.user.requires = IS_NOT_EMPTY()
db.bookmarks.cache.requires = IS_NOT_EMPTY()

# Log Table Defaults

# Log Table Field Labels
db.bookmarks.user.label = "User"
db.bookmarks.cache.label = "Cache"

# Log Table Fields Readable/Writeable edits
# ----------------------------------------------------

### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.commit()
