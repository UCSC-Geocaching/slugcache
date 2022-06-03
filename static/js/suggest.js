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
    newName: "",
    newHint: "",
    newDesc: "",
    newLat: 0,
    newLong: 0,
    center: 0,
    formMode: true,
  };
 
  app.enumerate = (a) => {
    // This adds an _idx field to each element of the array.
    let k = 0;
    a.map((e) => {
      e._idx = k++;
    });
    return a;
  };

  app.toggleForm = function (mode){
    app.vue.formMode = mode;
    app.map.dragPan.disable();
    app.map.scrollZoom.disable();
    app.map.doubleClickZoom.disable();
  }

  app.addCache = function () {
    axios.post(addCacheURL,
        {
            cache_name  : app.vue.newName,
            hint        : app.vue.newHint,
            description : app.vue.newDesc,
            lat      : app.vue.center.lat,
            long     : app.vue.center.lng,
        })
  };

  app.loadMap = function () {
    center = [-122.05820423052975, 36.98810503659569] //default SC
    const map = new mapboxgl.Map({
      container   : 'map',
      style       : 'mapbox://styles/mapbox/outdoors-v11',
      center      : center, 
      zoom        : 15,
      dragPan     : true,
      scrollZoom  : true,
      maxBounds   : [
                    [-122.08012683329952, 36.9750849217556], // SW coords
                    [-122.0349268336223, 37.00766046433793], // NW coords
                    ],
      });

    const el = document.createElement('div');  // create DOM element for the marker
    el.className = 'marker';
    el.id = "markerRadius";

    const marker = new mapboxgl.Marker(el, {
      draggable: false
      })
      .setLngLat(center)
      .addTo(map);
  
    map.on('move', function (e) {
      //console.log(`Current Map Center: ${map.getCenter()}`);
      app.vue.center = map.getCenter()
      marker.setLngLat(app.vue.center);
    });

    app.map = map;
    
  } 

  // This contains all the methods.
  app.methods = {
    loadMap: app.loadMap,
    addCache: app.addCache,
    toggleForm: app.toggleForm,
  };

  // This creates the Vue instance.
  app.vue = new Vue({
    el: '#vue-target',
    data: app.data,
    methods: app.methods,
    
  });

  // And this initializes it.
  app.init = () => {
    app.loadMap();

  };

  // Call to the initializer.
  app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
