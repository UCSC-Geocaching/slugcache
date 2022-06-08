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
    caches: [],
    currCache: null,
    newName: '',
    newHint: '',
    newDesc: '',
    newLat: 0,
    newLong: 0,
    newAuthID: "",
    newAuth: "",
    newDate: "",
    newSize: 0,
    newTerr: 0,
    newDiff: 0,
    center: 0,
    formMode: true,
    infoMode: false,
    max_boxes: 5,
  };

  app.enumerate = (a) => {
    // This adds an _idx field to each element of the array.
    let k = 0;
    a.map((e) => {
      e._idx = k++;
    });
    return a;
  };

  app.setInfoMode = function (mode, cache) {
    //console.log(cache)
    app.vue.infoMode = mode;
    if (cache != null) {
      app.vue.currCache = cache;
      app.vue.newName = cache.cache_name;
      app.vue.newDesc = cache.description;
      app.vue.newHint = cache.hint;
      app.vue.newLat = cache.lat;
      app.vue.newLong = cache.long;
      app.vue.newAuthID = cache.author;
      app.vue.newAuth = app.getUser();
      app.vue.newDate =  cache.creation_date;
      app.vue.newSize =  cache.size;
      app.vue.newTerr = cache.terrain;
      app.vue.newDiff = cache.difficulty;
    }
  };

  app.getUser = function () {
    axios.post(getUserURL, { id: app.vue.newAuthID }).then(function (r) {
      app.vue.newAuth =
        r.data['user']['first_name'] + ' ' + r.data['user']['last_name'];
    });
  };

  app.toggleForm = function (mode) {
    app.vue.formMode = mode;
    app.map.dragPan.disable();
    app.map.scrollZoom.disable();
    app.map.doubleClickZoom.disable();
  };

  app.disableInteraction = function () {
    app.map.dragPan.disable();
    app.map.scrollZoom.disable();
    app.map.doubleClickZoom.disable();
  };

  app.approveCache = function (cache) {
    app.updateCaches();
    axios.post(approveCacheURL, { id: app.vue.currCache.id });
  };

  app.denyCache = function () {
    app.updateCaches();
    axios.post(deleteCacheURL, { id: app.vue.currCache.id }); //Delete
  };

  app.updateCaches = function () {
    app.vue.caches = app.vue.caches.filter(
      (cache) => cache != app.vue.currCache
    ); //Update array
  };

  app.setCenter = function (cache) {
    app.map.flyTo({
      //Fly To animation details
      center: [cache.long, cache.lat],
      zoom: 17,
      speed: 1,
      curve: 1,
      easing(t) {
        return t;
      },
    });
  };

  app.addCache = function () {
    axios.post(addCacheURL,
        {
            cache_name  : app.vue.newName,
            hint        : app.vue.newHint,
            description : app.vue.newDesc,
            lat         : app.vue.center.lat,
            long        : app.vue.center.lng,
            valid       : 0,
            difficulty  : app.vue.newDiff,
            terrain     : app.vue.newTerr,
            size        : app.vue.newSize,
        })
      
  };

  app.loadMap = function () {
    center = [-122.05820423052975, 36.98810503659569]; //default SC
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: center,
      zoom: 15,
      dragPan: true,
      scrollZoom: true,
      maxBounds: [
        [-122.08012683329952, 36.9750849217556], // SW coords
        [-122.0349268336223, 37.00766046433793], // NW coords
      ],
    });

    const el = document.createElement('div'); // create DOM element for the marker
    el.className = 'marker';
    el.id = 'markerRadius';

    const marker = new mapboxgl.Marker(el, {
      draggable: false,
    })
      .setLngLat(center)
      .addTo(map);

    map.on('move', function (e) {
      //console.log(`Current Map Center: ${map.getCenter()}`);
      app.vue.center = map.getCenter();
      marker.setLngLat(app.vue.center);
    });

    app.map = map;
    app.map.setZoom(app.map.getZoom());
  };

  // This contains all the methods.
  app.methods = {
    loadMap: app.loadMap,
    addCache: app.addCache,
    toggleForm: app.toggleForm,
    setCenter: app.setCenter,
    disableInteraction: app.disableInteraction,
    setInfoMode: app.setInfoMode,
    approveCache: app.approveCache,
    denyCache: app.denyCache,
    updateCaches: app.updateCaches,
    getUser: app.getUser,
  };

  // This creates the Vue instance.
  app.vue = new Vue({
    el: '#vue-target',
    data: app.data,
    methods: app.methods,
  });

  // And this initializes it.
  app.init = () => {
    axios.get(loadGeoCachesURL).then(function (r) {
      app.vue.caches = r.data.caches.filter((cache) => cache.valid == 0);
      app.vue.caches = app.enumerate(app.vue.caches);
    });
    app.loadMap();
  };

  // Call to the initializer.
  app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
