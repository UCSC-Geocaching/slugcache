# Slug Cache

Slug Cache is a Geocaching app made specifically for UCSC students and faculty. The map and caches focus on some of the campus' points of interest. In addition, users are allowed to suggest further caches to be added.

We had a lot of fun creating this for CSE183, Spring 2022.

## Team Members

  - [Albert Yuan](https://github.com/ayyce)
  - [Brandon Wong](https://github.com/Brwonze)
  - [Christopher Sterza](https://github.com/ChristopherSterza)
  - [Geo Ochoa](https://github.com/geoochoa)

## How to Run
We had a little trouble hosting the app online. We used Google App Engine and Cloud SQL to host it, and the link to the hosted product can be found here: **[Slug Cache](https://slug-cache-personal.wl.r.appspot.com/)**

If you wish to run your own copy locally, you must first install **[py4web](https://py4web.com/_documentation/static/en/chapter-03.html)**. Once installed, simply clone this repo into the **apps** folder and run **`./py4web.py run apps`**. Now that the server is running, the app can be accessed by pointing a browser to **`http://localhost:8000/{appname}`**.

To play around with the app, create an account, log in, and set up some initial caches with the **`/setup`** endpoint. You may also wish to make your account an admin account in order to vet caches that others want to add. To do that, acces the **`/make_admin`** endpoint from the account you wish to make an admin.
It is advised to remove these endpoints before deploying your app.

## Demo

Demo Link: https://www.youtube.com/watch?v=D930IxmufzM
