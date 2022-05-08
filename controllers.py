"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import (
    db,
    session,
    T,
    cache,
    auth,
    logger,
    authenticated,
    unauthenticated,
    flash,
)
from py4web.utils.url_signer import URLSigner
from .models import get_user_email

from datetime import datetime

url_signer = URLSigner(session)


@action("index")
@action.uses("index.html", auth.user)
def index():
    return {}


@action("login")
@action.uses("login.html", auth)
def login():
    if auth.is_logged_in:
        redirect(URL())
    return {
        "base_url": URL(),
        "next": request.query.get("next") or URL()
    }


@action("register")
@action.uses("register.html", auth)
def register():
    if auth.is_logged_in:
        redirect(URL())
    return {
        "base_url": URL(),
        "next": request.query.get("next") or URL()
    }


@action("map")
@action.uses("map.html", db, auth.user)
def mapp():
    return {}


@action("suggest")
@action.uses("suggest.html", db, auth.user)
def suggest():
    return {}


@action("profile")
@action.uses("profile.html", db, auth.user)
def profile():
    return {}


@action("bookmarks")
@action.uses("bookmarks.html", db, auth.user)
def bookmarks():
    return {}


# TODO: MAKE SURE TO REMOVE FOR PRODUCTION
@action("setup")
@action.uses(db, auth)
def setup():
    creation_date = datetime.now()
    db.users.insert(
        first_name="Chris",
        last_name="Sterza",
        user_email="csterza@ucsc.edu",
        creation_date=creation_date,
        banner_path="",
        photo_profile_path="",
        caches_logged=5,
        caches_hidden=3,
    )
    db.caches.insert(
        cache_name="Test Cache Name",
        photo_path="",
        lat=37.00,
        long=-122.05,
        description="Test description",
        hint="Test hint",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    creation_date = datetime.now()
    db.users.insert(
        first_name="Hello",
        last_name="world",
        user_email="helloworld@ucsc.edu",
        creation_date=creation_date,
        banner_path="",
        photo_profile_path="",
        caches_logged=2,
        caches_hidden=1,
    )
    db.caches.insert(
        cache_name="AppleE",
        photo_path="",
        lat=47.00,
        long=-112.05,
        description="a fruit",
        hint="u eat dis",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    db.caches.insert(
        cache_name="pineapple",
        photo_path="",
        lat=47.00,
        long=-112.05,
        description="a fruit",
        hint="u eat dis",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    db.caches.insert(
        cache_name="banana",
        photo_path="",
        lat=47.00,
        long=-112.05,
        description="a fruit",
        hint="u eat dis",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    creation_date = datetime.now()
    db.users.insert(
        first_name="first name",
        last_name="last naem",
        user_email="firstlast@ucsc.edu",
        creation_date=creation_date,
        banner_path="",
        photo_profile_path="",
        caches_logged=7,
        caches_hidden=7,
    )
    db.caches.insert(
        cache_name="pear",
        photo_path="",
        lat=47.00,
        long=-112.05,
        description="a fruit",
        hint="u eat dis",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    redirect(URL("index"))


# TODO: MAKE SURE TO REMOVE FOR PRODUCTION
@action("clear_db")
@action.uses(db, auth)
def clear_db():
    db.users.truncate()
    db.caches.truncate()
    redirect(URL("index"))
