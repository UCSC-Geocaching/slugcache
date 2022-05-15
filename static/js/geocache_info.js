// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        caches: [],
        cache_name: "",
        cache_photo_path: "",
        cache_lat: 0.0,
        cache_long: 0.0,
        cache_desc: "",
        cache_hint: "",
        cache_author_id: null,
        cache_author: "",
        cache_create_date: "",
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };
    
    app.processCache = function (a) {
        app.vue.cache_name = a.cache_name ,
        app.vue.cache_photo_path = a.photo_path,
        app.vue.cache_lat = a.lat,
        app.vue.cache_long = a.long,
        app.vue.cache_desc = a.description,
        app.vue.cache_hint = a.hint,
        app.vue.cache_author_id = a.author,
        app.vue.cache_author = app.getUser(),
        app.vue.cache_create_date = a.creation_date
    };

    app.getUser = function () {
        axios.post(getUserURL, {id: app.vue.cache_author_id}).then(function (r) {
            app.vue.cache_author = r.data['user']['first_name'] + " " + r.data['user']['last_name']
        })
    };

    app.bookmark = function () {
        console.log("Bookmark was pressed")
    }

    // This contains all the methods.
    app.methods = {
        processCache: app.processCache,
        getUser: app.getUser,
        bookmark: app.bookmark,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        axios.get(loadGeoCachesURL).then(function (r) {
            app.vue.caches = app.enumerate(r.data.caches);
            app.processCache(app.vue.caches[0]);
        })
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);


