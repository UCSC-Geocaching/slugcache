// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let page = {};

// Given an empty page object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (page) => {
  // This is the Vue data.
  page.data = {
    // Complete as you see fit.
    bookmarks: [],
    max_boxes: 5,
  };

  page.enumerate = (a) => {
    // This adds an _idx field to each element of the array.
    let k = 0;
    a.map((e) => {
      e._idx = k++;
    });
    return a;
  };

  // This contains all the methods.
  page.methods = {
    // Complete as you see fit.
    get_bookmarks: function () {
      axios.get(get_bookmarks_url).then(function (res) {
        tmp_bookmarks = res.data.bookmarks;
        tmp_bookmarks.forEach((bookmark) => {
          bookmark.map_src = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/${bookmark.long},${bookmark.lat},17/300x250?access_token=pk.eyJ1IjoiY3N0ZXJ6YSIsImEiOiJjbDF0dDRleG0yMWpkM2Ztb3B0YWZoaTR6In0.09vTcRrP3ty1lWFuouDsiw`;
        });
        page.data.bookmarks = tmp_bookmarks;
      });
    },
  };

  // This creates the Vue instance.
  page.vue = new Vue({
    el: '#vue-target',
    data: page.data,
    methods: page.methods,
    created: function () {
      this.get_bookmarks();
    },
  });
};

// This takes the (empty) page object, and initializes it,
// putting all the code i
init(page);
