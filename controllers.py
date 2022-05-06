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
@action.uses("index.html", db, auth, url_signer)
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url=URL("my_callback", signer=url_signer),
    )


@action("map")
@action.uses("map.html", db, auth)
def login():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url=URL("my_callback", signer=url_signer),
    )


@action("suggest")
@action.uses("suggest.html", db, auth)
def login():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url=URL("my_callback", signer=url_signer),
    )


@action("profile")
@action.uses("profile.html", db, auth)
def login():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url=URL("my_callback", signer=url_signer),
    )


@action("bookmarks")
@action.uses("bookmarks.html", db, auth)
def login():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url=URL("my_callback", signer=url_signer),
    )


# MAKE SURE TO REMOVE FOR PRODUCTION
@action("setup")
@action.uses(db, auth)
def setup():
    db.users.insert(
        first_name="Chris",
        last_name="Sterza",
        user_email="csterza@ucsc.edu",
        creation_date=datetime.now(),
        banner_path="",
        photo_profile_path="",
        caches_logged=5,
        caches_hidden=3,
    )
    my_ref = db(db.users.user_email == "csterza@ucsc.edu").select().first()
    print(my_ref)
    db.caches.insert(
        cache_name="Test Cache Name",
        photo_path="",
        lat=37.00,
        long=-122.05,
        description="Test description",
        hint="Test hint",
        author=my_ref.id,
        creation_date=datetime.now(),
    )
    redirect(URL("index"))
    return dict()
