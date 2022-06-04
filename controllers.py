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

from unittest import result
from webbrowser import get
from requests import delete
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

from datetime import date, datetime, timedelta


url_signer = URLSigner(session)

# Login Controllers--------------------------------------------------
@action("login")
@action("register")
@action("request_reset_password")
@action("index")
@action.uses("index.html", auth, url_signer)
def index():
    logged_out_endpoints = (
        URL(endpoint) for endpoint in ("login", "register", "request_reset_password")
    )
    if request.fullpath in logged_out_endpoints and auth.is_logged_in:
        redirect(URL("map"))
    return {
        "base_url": URL(),
        "add_user_url": URL("add_user", signer=url_signer),
    }


@action("custom_auth/reset_password")
@action.uses("reset_pw.html", auth)
def resetpw():
    return {"base_url": URL()}


# Profile Page Controllers-------------------------------------------
@action("profile")
@action.uses("profile.html", db, auth.user)
def profile():
    return dict(load_profile_url=URL("load_profile_details"))


@action("load_profile_details")
@action.uses(db, auth.user)
def load_profile_details():
    user = auth.get_user()
    profile = db(db.users.user_id == user["id"]).select().first()
    return dict(profile=profile)


# Map Page Controllers-----------------------------------------------
@action("map")
@action.uses("map.html", db, auth, url_signer)
def map():
    return dict(
        loadGeoCachesURL=URL("loadGeoCaches", signer=url_signer),
        searchURL=URL("search", signer=url_signer),
        generateCacheURL=URL("generateCacheURL", signer=url_signer),
    )


@action("loadGeoCaches")
@action.uses(db)
def getCaches():
    rows = db(db.caches).select().as_list()
    return dict(caches=rows)


@action("search")
@action.uses()
def search():
    rows = db(db.caches).select().as_list()
    return dict(caches=rows)


@action("generateCacheURL")
@action.uses(db, url_signer, url_signer.verify())
def generateCacheURL():
    cache_id = int(request.params.get("cache_id"))
    return dict(url=URL("cache_info", cache_id, signer=url_signer))


# Bookmarks Page Controllers-----------------------------------------
@action("bookmarks", method="GET")
@action.uses("bookmarks.html", db, auth.user, url_signer)
def bookmarks():
    return dict(get_bookmarks_url=URL("get_bookmarks", signer=url_signer))


@action("get_bookmarks", method="GET")
@action.uses(db, auth.user, url_signer.verify())
def get_bookmarks():
    # First user is from auth_user table
    bookmarks = []
    user = auth.get_user()
    assert user is not None
    # This user is from Users table
    user = db(db.users.user_id == user["id"]).select().first()
    assert user is not None
    tmp_bookmarks = db(db.bookmarks.user == user["id"]).select().as_list()
    for bookmark in tmp_bookmarks:
        cache = db.caches[bookmark["cache"]]
        cache["href"] = URL("cache_info", cache.id, signer=url_signer)
        bookmarks.append(cache)

    return dict(bookmarks=bookmarks)


# Cache Info Page Controllers----------------------------------------
@action("cache_info/<cache_id:int>")
@action.uses("cache_info.html", db, auth.user, url_signer)
def cache_info(cache_id=None):
    return dict(
        getCacheURL=URL("getCache", cache_id, signer=url_signer),
        getUserURL=URL("getUser", signer=url_signer),
        setBookmarkedURL=URL("setBookmarked", cache_id, signer=url_signer),
        getBookmarkedURL=URL("getBookmarked", cache_id, signer=url_signer),
        logCacheURL=URL("logCache", cache_id, signer=url_signer),
        getLogsURL=URL("getLogs", cache_id),
        checkTimerURL=URL("checkTimer", cache_id, signer=url_signer),
    )


@action("getCache/<cache_id:int>")
@action.uses(db)
def getCache(cache_id=None):
    cache = db(db.caches._id == cache_id).select().first()
    return dict(cache=cache)


@action("setBookmarked/<cache_id:int>", method="PUT")
@action.uses(db, auth, url_signer.verify())
def setBookmarked(cache_id=None):
    # First user is from auth_user table
    bookmarked = False
    user = auth.get_user()
    assert user is not None
    # This user is from Users table
    user = db(db.users.user_id == user["id"]).select().first()
    assert user is not None
    assert cache_id is not None
    bookmark = (
        db((db.bookmarks.user == user["id"]) & (db.bookmarks.cache == cache_id))
        .select()
        .first()
    )
    if bookmark is None:
        db.bookmarks.update_or_insert(user=user["id"], cache=cache_id)
        bookmarked = True
    else:
        del db.bookmarks[bookmark["id"]]
        bookmarked = False
    return dict(bookmarked=bookmarked)


@action("getBookmarked/<cache_id:int>", method="GET")
@action.uses(db, auth, url_signer.verify())
def getBookmarked(cache_id=None):
    # First user is from auth_user table
    user = auth.get_user()
    assert user is not None
    # This user is from Users table
    user = db(db.users.user_id == user["id"]).select().first()
    assert user is not None
    assert cache_id is not None
    bookmark = (
        db((db.bookmarks.user == user["id"]) & (db.bookmarks.cache == cache_id))
        .select()
        .first()
    )
    if bookmark is None:
        bookmarked = False
    else:
        bookmarked = True
    return dict(bookmarked=bookmarked)


@action("logCache/<cache_id:int>", method="PUT")
@action.uses(db, auth.user, url_signer.verify())
def logCache(cache_id=None):
    # First user is from auth_user table
    auth_user_data = auth.get_user()
    assert auth_user_data is not None
    # This user is from Users table
    user = db(db.users.user_id == auth_user_data["id"]).select().first()
    discover_date = datetime.now()
    assert user is not None
    assert cache_id is not None
    assert discover_date is not None

    # Check the timer before logging
    newest_log = (
        db((db.logs.cache == cache_id) & (db.logs.logger == user["id"])).select().last()
    )
    result = checkLogTimer(newest_log)
    if result["disabled"]:
        return dict(log=None)

    # Add the log
    log_id = db.logs.insert(logger=user.id, cache=cache_id, discover_date=discover_date)
    log = db.logs[log_id]
    log["first_name"] = auth_user_data["first_name"]
    log["last_name"] = auth_user_data["last_name"]

    # Update caches loged counter
    db(db.users.id == user.id).update(caches_logged=user.caches_logged + 1)

    return dict(log=log)


@action("getLogs/<cache_id:int>", method="GET")
@action.uses(db, auth.user)
def getLogs(cache_id=None):
    logs = db(db.logs.cache == cache_id).select().as_list()
    # Add name attributes to logs
    for log in logs:
        user = db(db.users.id == log["logger"]).select().first()
        auth_user_data = db(db.auth_user.id == user["user_id"]).select().first()
        log["first_name"] = auth_user_data["first_name"]
        log["last_name"] = auth_user_data["last_name"]
    # Figure out how to query only last 10 logs.
    # logs = db(db.executesql('SELECT * FROM logs order by id desc limit 10;'))
    return dict(logs=logs)


@action("checkTimer/<cache_id:int>", method="GET")
@action.uses(db, auth.user, url_signer.verify())
def checkTimer(cache_id=None):
    # First user is from auth_user table
    auth_user_data = auth.get_user()
    assert auth_user_data is not None
    # This user is from Users table
    user = db(db.users.user_id == auth_user_data["id"]).select().first()
    assert user is not None
    newest_log = (
        db((db.logs.cache == cache_id) & (db.logs.logger == user["id"])).select().last()
    )
    result = checkLogTimer(newest_log)
    return dict(
        disabled=result["disabled"],
        refresh_time=result["refresh_time"],
    )


# Suggest Page Controllers-------------------------------------------
@action("suggest")
@action.uses("suggest.html", db, auth.user, url_signer)
def suggest():
    return dict(addCacheURL=URL("addCache", signer=url_signer))


@action("addCache", method="POST")
@action.uses(db, auth, url_signer.verify())
def addCache():
    db.caches.insert(
        cache_name=request.json.get("cache_name"),
        hint=request.json.get("hint"),
        description=request.json.get("description"),
        lat=request.json.get("lat"),
        long=request.json.get("long"),
        author=db(db.users.user_email == get_user_email).select().first().id,
    )
    redirect(URL("map"))


# Miscellaneous Controllers------------------------------------------
@action("add_user", method="POST")
@action.uses(db, auth, url_signer.verify())
def register_user():
    user = auth.get_user()
    db.users.insert(
        user_id=user["id"],
        first_name=request.json.get("first_name"),
        last_name=request.json.get("last_name"),
        user_email=request.json.get("email"),
    )


@action("getUser", method="POST")
@action.uses(db)
def getUser():
    id = request.json.get("id")
    user = db(db.users._id == id).select().first()
    return dict(user=user)


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
        cache_name="Arboretum",
        photo_path="",
        lat=36.98267070650899,
        long=-122.05985900885949,
        description="This Arboretum cache is...",
        hint="Test hint",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    creation_date = datetime.now()
    db.users.insert(
        first_name="Hello",
        last_name="World",
        user_email="helloworld@ucsc.edu",
        creation_date=creation_date,
        banner_path="",
        photo_profile_path="",
        caches_logged=2,
        caches_hidden=1,
    )
    db.caches.insert(
        cache_name="Quarry Amphitheater",
        photo_path="",
        lat=36.9986320770141,
        long=-122.05648938884585,
        description="This Quarry cache is...",
        hint="u eat dis",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    db.caches.insert(
        cache_name="Jack Baskin",
        photo_path="",
        lat=37.0005353033127,
        long=-122.06380507461215,
        description="This Jack Baskin cache is...",
        hint="u eat dis",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    db.caches.insert(
        cache_name="Porter",
        photo_path="",
        lat=36.99473025211556,
        long=-122.06554686691216,
        description="This Porter cache is...",
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
        cache_name="East Remote",
        photo_path="",
        lat=36.9911648945102,
        long=-122.0534244573749,
        description="This East Remote cache is...",
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


# Helper Functions---------------------------------------------------
def checkLogTimer(newest_log=None):
    # No log at this cache for this user
    if newest_log is None:
        return dict(disabled=False)
    # Check if the most recent log is old enough
    log_time = newest_log["discover_date"]
    refresh_time = log_time + timedelta(minutes=15)
    time_now = datetime.now()
    # Now is past the refresh time limit
    if time_now > refresh_time:
        return dict(disabled=False, refresh_time=refresh_time)
    # Is hasn't been enough time yet
    else:
        return dict(disabled=True, refresh_time=refresh_time)