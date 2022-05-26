mapboxgl.accessToken =
  'pk.eyJ1IjoiY3N0ZXJ6YSIsImEiOiJjbDF0dDRleG0yMWpkM2Ztb3B0YWZoaTR6In0.09vTcRrP3ty1lWFuouDsiw'; //store in environ var.
// ##################################

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

/**
 * Given an empty app object, initializes it filling its attributes,
 *      creates a Vue instance, and then initializes the Vue instance.
 */
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        caches: [],
        query: "",
        results: [],
        popups: [],
        popupMode: false,
        cacheTitle: "",
        cacheDescr: "",
        cacheID: 0,
        loadingMode: true,
        loadMode: true,
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };
      
    /**
    * Sets GPS position to coordinates pointed to by position
    */
    app.successLocation = function(position){
        setupMap([position.coords.longitude, position.coords.latitude])
    }
    
    /**
    * Error handler, sets GPS location to a default SC coordinate
    */
    app.errorLocation = function(){
        setupMap([-122.05820423052975, 36.98810503659569])
    }

    /**
    * Adds marker for current location, begins tracking
    * Will only reutrn current location if inside UCSC bounds
    */
   app.addGeoTracking = function(map ){
        map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true,
                timeout: 5000
            },
        trackUserLocation: true,
        showUserHeading: true
        }));
   }

     /**
    * Adds Navigation Bars/Controls
    */
    app.addNav = function (map) {
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav);
    }

    /**
     * Loads all the marker (geocache) locations 
     * Adds click events to all for popups
     * Stop Propagation prevents chaining of click
     *      events from map.click()->marker.click()
     */
    app.loadLocations = function (map) {

        for (let cache of app.vue.caches) {

            // create DOM element for the marker
            const el = document.createElement('div');
            el.id = 'marker';
            
            // click event for popups on markers
            el.addEventListener('click', (e) => {
                app.vue.cacheTitle = cache.cache_name;
                app.vue.cacheDescr = cache.description;
                app.vue.cacheID = cache.id; //set id to send to cache_info redirect
                app.vue.popupMode = true;
                app.setPopup();
                e.stopPropagation();
            }); 

            // create the marker
            new mapboxgl.Marker(el)
                .setLngLat([cache.long, cache.lat])
                .addTo(map);
        }

    }

    /**
     * Search function, reads from query and finds a 
     *      cache with the same title (STRICT, ideally
     *      should be less strict)
     */
    app.search = function () {
        if (app.vue.query.length > 1) {
            axios.get(searchURL, {params: {q: app.vue.query}})
                .then( function(result) {

                    for (let cache of app.vue.caches) {
                        if(app.vue.query == cache.cache_name){ //Fly to location if
                            app.map.flyTo({ //Fly To animation details
                                center: [cache.long,cache.lat],
                                zoom: 17,
                                speed: 1,
                                curve: 1,
                                easing(t) {
                                    return t;
                                    }
                                });
                            app.vue.cacheTitle = cache.cache_name; //Sets details
                            app.vue.cacheDescr = cache.description;
                            app.vue.cacheID = cache.id; //Setting ID as well
                            app.vue.popupMode = true;
                            app.setPopup(); // Activates Popup on search
                        }
                    }

                    app.vue.results = result.data.results;
                });
        }
        else
            app.vue.results = [];
    }

    app.redirectCacheInfo = function () {
        axios.get(generateCacheURL, {params: {cache_id: app.vue.cacheID}})
        .then(function (r) {
            console.log("We got the URL:", r.data.url);
            let cache_url = document.createElement('a');
            cache_url.href = r.data.url;
            cache_url.click();
        });
    }

    /**
     * Resets Popup
     * Timeout Function handles marker to marker transitions
     */
    app.setPopup = function () {
        if(app.vue.popupMode == true){ //sounds redundant, but for transition of popups
            app.vue.popupMode = false;
             setTimeout(() => {
                    app.vue.popupMode = true;
                }, "200")
            }
        else 
            app.vue.popupMode = true;
        }
    
         

    /**
    * This contains all the methods.
    */
    app.methods = {
        // Complete as you see fit.
        successLocation: app.successLocation,
        errorLocation: app.errorLocation,
        addGeoTracking: app.addGeoTracking,
        addNav: app.addNav,
        loadLocations: app.loadLocations,
        search: app.search,
        redirectCacheInfo: app.redirectCacheInfo,
        setPopup: app.setPopup,
        
    };

    /**
     * This creates the Vue instance.
     */
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    /**
     * And this initializes it.
     */
    app.init = () => {
        axios.get(loadGeoCachesURL).then(function (r) {
            app.vue.caches = app.enumerate(r.data.caches);
        })
    };

    /**
     * Sets the map
     */
    app.setMap = function(map) {
        app.map = map;

        app.addNav(map) //nav controls
        app.addGeoTracking(map)
        app.loadLocations(map) //needs to be passed the db

    };

    /**
     * Call to the initializer.
     */ 
    app.init();
};

/**
 * This takes the (empty) app object, and initializes it,
 *         putting all the code i
 */
init(app);
 
/**
 * Gets current position to start map initializer
 */
navigator.geolocation.getCurrentPosition(
  app.successLocation,
  app.errorLocation,
  { enableHighAccuracy: true }
);

/**
 * Map Initialization
 */
function setupMap(center) {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v11',
    center: center,
    zoom: 12,
    maxBounds: [
      [-122.08012683329952, 36.9750849217556], // Southwest coordinates
      [-122.0349268336223, 37.00766046433793], // Northeast coordinates
    ],
    });

    map.on('click', () => {
        if(app.vue.popupMode == true)
            app.vue.popupMode = false;
    });

    var elapsed = false;
    var loaded = false;

    setTimeout(() => {
        elapsed = true;
        if (loaded){
            app.vue.loadMode = false;
            document.getElementById("map").style.zIndex="0";
        }
    }, "1500")
    
    map.on('load', function() {
        loaded = true;
        if (elapsed){
            app.vue.loadMode = false;
            document.getElementById("map").style.zIndex="0";
        }
    });



/*
    map.on('load', function () {
       app.vue.loadMode = false;
    }); 
    */

    map.resize();

    app.setMap(map);

    
}
