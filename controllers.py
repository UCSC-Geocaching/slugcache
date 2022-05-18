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


@action("login")
@action("register")
@action("index")
@action.uses("index.html", auth, url_signer)
def index():
    if request.fullpath in (URL("login"), URL("register")) and auth.is_logged_in:
        redirect(URL("map"))
    return {
        "base_url": URL(),
        "add_user_url": URL("add_user", signer=url_signer),
    }


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


@action("map")
@action.uses("map.html", db, auth, url_signer)
def map():
    return dict(
        loadGeoCachesURL=URL("loadGeoCaches", signer=url_signer),
        searchURL=URL("search", signer=url_signer),
        generateCacheURL=URL("generateCacheURL", signer=url_signer),
    )


@action("suggest")
@action.uses("suggest.html", db, auth.user)
def suggest():
    return ()


@action("profile")
@action.uses("profile.html", db, auth.user)
def profile():
    return dict(load_profile_url=URL("load_profile_details"))


@action("bookmarks")
@action.uses("bookmarks.html", db, auth.user)
def bookmarks():
    return ()


@action("cache_info/<cache_id:int>")
@action.uses("cache_info.html", db, auth.user)
def cache_info(cache_id=None):
    return dict(
        getCacheURL=URL("getCache", cache_id, signer=url_signer),
        getUserURL=URL("getUser", signer=url_signer),
    )


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
        description="Arboretum description etc etc",
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
        description="Quarry description etc etc",
        hint="u eat dis",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    db.caches.insert(
        cache_name="Jack Baskin",
        photo_path="",
        lat=37.0005353033127,
        long=-122.06380507461215,
        description="Jack Baskin description etc etc",
        hint="u eat dis",
        author=db(db.users.creation_date == creation_date).select().first().id,
        creation_date=datetime.now(),
    )
    db.caches.insert(
        cache_name="Porter",
        photo_path="",
        lat=36.99473025211556,
        long=-122.06554686691216,
        description="Porter description etc etc",
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
        description="East Remote description etc etc",
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


@action("loadGeoCaches")
@action.uses(db)
def getCaches():
    rows = db(db.caches).select().as_list()
    return dict(caches=rows)

@action("getCache/<cache_id:int>")
@action.uses(db)
def getCache(cache_id = None):
    cache = db(db.caches._id == cache_id).select().first()
    return dict(cache=cache)

@action("generateCacheURL")
@action.uses(db, url_signer, url_signer.verify())
def generateCacheURL():
    cache_id = int(request.params.get('cache_id'))
    return dict(url=URL('cache_info', cache_id, signer=url_signer))

@action("search")
@action.uses()
def search():
    rows = db(db.caches).select().as_list()
    return dict(caches=rows)


@action("getUser", method="POST")
@action.uses(db)
def getUser():
    id = request.json.get("id")
    user = db(db.users._id == id).select().first()
    return dict(user=user)


@action("load_profile_details")
@action.uses(db, auth.user)
def load_profile_details():
    user = auth.get_user()
    profile = db(db.users.user_id == user["id"]).select().first()
    return dict(profile=profile)