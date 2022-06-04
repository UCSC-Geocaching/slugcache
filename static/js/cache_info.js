mapboxgl.accessToken =
  'pk.eyJ1IjoiY3N0ZXJ6YSIsImEiOiJjbDF0dDRleG0yMWpkM2Ztb3B0YWZoaTR6In0.09vTcRrP3ty1lWFuouDsiw'; //store in environ var.
// ##################################

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
  // This is the Vue data.
  app.data = {
    cache_name: '',
    cache_photo_path: '',
    cache_lat: 0.0,
    cache_long: 0.0,
    cache_desc: '',
    cache_hint: '',
    cache_author_id: null,
    cache_author: '',
    cache_create_date: '',
    cache_diff: 1,
    cache_terrain: 1,
    cache_size: 1,
    cache_max_boxes: 5,
    bookmarked: false,
    cache_logs: [],
    button_disabled: false,
    refresh_time: {},
  };

  app.processCache = function (a) {
    (app.vue.cache_name = a.cache_name),
      (app.vue.cache_photo_path = a.photo_path),
      (app.vue.cache_lat = a.lat),
      (app.vue.cache_long = a.long),
      (app.vue.cache_desc = a.description),
      (app.vue.cache_hint = a.hint),
      (app.vue.cache_author_id = a.author),
      (app.vue.cache_author = app.getUser()),
      (app.vue.cache_create_date = a.creation_date),
      (app.vue.cache_diff = a.difficulty),
      (app.vue.cache_terrain = a.terrain),
      (app.vue.cache_size = a.size),
      axios.get(getBookmarkedURL).then(function (r) {
        app.vue.bookmarked = r.data.bookmarked;
      });
  };

  app.getUser = function () {
    axios.post(getUserURL, { id: app.vue.cache_author_id }).then(function (r) {
      app.vue.cache_author =
        r.data['user']['first_name'] + ' ' + r.data['user']['last_name'];
    });
  };

  app.bookmark = function () {
    axios.put(setBookmarkedURL).then(function (r) {
      app.vue.bookmarked = r.data.bookmarked;
    });
  };

  app.loadMap = function () {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [app.vue.cache_long, app.vue.cache_lat],
      zoom: 16,
      dragPan: false,
      scrollZoom: false,
      maxBounds: [
        [-122.08012683329952, 36.9750849217556], // SW coords
        [-122.0349268336223, 37.00766046433793], // NW coords
      ],
    });
  };

  app.logCache = function () {
    axios.put(logCacheURL).then(function (r) {
      if (r.data.log != null) {
        app.getLogs();
      }
      app.checkTimer();
    });
  };

  app.getLogs = function () {
    axios.get(getLogsURL).then(function (r) {
      // Reverse chronological order
      tmpLogs = r.data.logs.reverse();
      // Format the dates
      tmpLogs.forEach((log) => {
        tmp_date = new Date(log.discover_date.replace(' ', 'T'));
        log.discover_month = tmp_date.getMonth() + 1;
        log.discover_day = tmp_date.getDate();
        log.discover_year = tmp_date.getFullYear();
      });
      // Get only up to 5 logs
      tmpLogs.length = Math.min(tmpLogs.length, 5);
      app.vue.cache_logs = tmpLogs;
    });
  };

  app.checkTimer = function () {
    axios.get(checkTimerURL).then(function (r) {
      app.vue.button_disabled = r.data.disabled;
      raw_datetime = new Date(r.data.refresh_time.replace(' ', 'T'));
      app.vue.refresh_time.month = raw_datetime.getMonth() + 1;
      app.vue.refresh_time.date = raw_datetime.getDate();
      app.vue.refresh_time.year = raw_datetime.getFullYear();
      app.vue.refresh_time.time = r.data.refresh_time.split(' ')[1];
    });
  };

  // This contains all the methods.
  app.methods = {
    processCache: app.processCache,
    getUser: app.getUser,
    bookmark: app.bookmark,
    loadMap: app.loadMap,
    logCache: app.logCache,
    getLogs: app.getLogs,
    checkTimer: app.checkTimer,
  };

  // This creates the Vue instance.
  app.vue = new Vue({
    el: '#vue-target',
    data: app.data,
    methods: app.methods,
  });

  // And this initializes it.
  app.init = () => {
    // Put here any initialization code.
    // Typically this is a server GET call to load the data.
    axios.get(getCacheURL).then(function (r) {
      app.processCache(r.data.cache);
      app.getLogs();
      app.checkTimer();
    });

    setTimeout(() => {
      app.loadMap();
    }, '200');
  };

  // Call to the initializer.
  app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
