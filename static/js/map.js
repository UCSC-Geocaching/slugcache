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
        loadMode: true,
        markerSelected: [],
        searchMode: false,
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
     * Fly's to geocache specified by parameter `cache`
     */
    app.flyToCache = function(cache) {
        app.map.flyTo({ //Fly To animation details
            center: [cache.long,cache.lat],
            zoom: 17,
            speed: 1,
            curve: 1,
            easing(t) {
                return t;
                }
            });
    }

    /**
     * Updates scale of current active marker on map to indicate selection.
     *      markerSelected holds the previously selected marker
     *      Height and Width are reset and markerSelected gets current marker
     *      specified by parameter `marker`
     */
    app.resetMarkerSize = function(marker) {    
        if((app.vue.markerSelected).length != 0){ //curr marker selected
            (app.vue.markerSelected[0]).setAttribute("style", 
                    "width: 28px; height: 28px; border-style: none; background-color: null;");
        }
        if(marker === null)
            (app.vue.markerSelected).pop();
        else app.vue.markerSelected[0] = marker;
    }

    app.setSearchMode = function(mode) {
        app.vue.searchMode = mode;
    }

    /**
     * Loads all the marker (geocache) locations 
     * Adds click events to all for popups
     * Stop Propagation prevents chaining of click
     *      events from map.click() => marker.click()
     */
    app.loadLocations = function (map) {

        for (let cache of app.vue.caches) {
            const el = document.createElement('div');  // create DOM element for the marker
            el.className = 'marker';
            el.id = "marker-" + cache.id;
            
            el.addEventListener('click', (e) => { // click event for popups on markers
                app.resetMarkerSize(el);
                el.setAttribute("style", 
                    "width: 35px; height: 35px; border: 2px; border-style: solid; border-color: #fdc700; background-color: #fdc700;");
        
                app.vue.cacheTitle = cache.cache_name;
                app.vue.cacheDescr = cache.description;
                app.vue.cacheID = cache.id; //set id to send to cache_info redirect
                app.vue.popupMode = true;
                app.flyToCache(cache)
                app.setPopup();
                e.stopPropagation();
            }); 

            new mapboxgl.Marker(el) // create the marker
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
                            document.getElementById("marker-" + cache.id).click();
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
        flyToCache: app.flyToCache,
        resetMarkerSize: app.resetMarkerSize,
        setSearchMode: app.setSearchMode,
        
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

    map.on('click', () => { //Click event to remove/toggle popup and size for marker
        app.vue.query = "";
        app.vue.searchMode = false;
        if(app.vue.popupMode == true){
            app.vue.popupMode = false;
            app.resetMarkerSize(null);
            map.setZoom(map.getZoom()); //Temp fix, addresses issue of marker needing
                                        //  a map movement trigger to be repainted
                                        //  after being reset
        }
    });
 
    var elapsed = false; 
    var loaded = false;
    setTimeout(() => { //Ensures loading screen is displayed for a minimum time
        elapsed = true; //If elapsed time has been reached and map is loaded: display
        if (loaded){
            app.vue.loadMode = false;
            document.getElementById("map").style.zIndex="0"; //clean up
        }
    }, "1500")

    map.on('load', function() { //If map has loaded, activate loaded boolean to true
        loaded = true; //Ensure min time has been reached
        if (elapsed){
            app.vue.loadMode = false;
            document.getElementById("map").style.zIndex="0";
        }
    });

    map.resize();

    app.setMap(map);

    
}
