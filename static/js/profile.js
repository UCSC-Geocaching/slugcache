// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let page = {};

// Given an empty page object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (page) => {
  // This is the Vue data.
  page.data = {
    // Complete as you see fit.
    user_email: '',
    creation_date: '',
    logs: 0,
    hides: 0,
    banner_URL: '',
    profile_pic_URL: '',
  };

  page.enumerate = (a) => {
    // This adds an _idx field to each element of the array.
    let k = 0;
    a.map((e) => {
      e._idx = k++;
    });
    return a;
  };

  // Custom Functions
  // loadProfile: Loads the profile details from the users db.
  page.loadProfile = function () {
    axios.get(load_profile_url).then(function (r) {
      let profile = r.data.profile;
      page.vue.user_email = profile.user_email;
      page.vue.creation_date = profile.creation_date;
      page.vue.logs = profile.caches_logged;
      page.vue.hides = profile.caches_hidden;
      page.vue.banner_URL = '..' + profile.banner_path; // Should change this
      page.vue.profile_pic_URL = '..' + profile.profile_photo_path; // Should change this
    });
  };

  // This contains all the methods.
  page.methods = {
    // Complete as you see fit.
    loadProfile: page.loadProfile,
  };

  // This creates the Vue instance.
  page.vue = new Vue({
    el: '#vue-target',
    data: page.data,
    methods: page.methods,
  });

  // And this initializes it.
  page.init = () => {
    // Put here any initialization code.
    // Typically this is a server GET call to load the data.
    // TODO: FIGURE OUT HOW TO USE THE loadProfile METHOD TO LOAD AT INIT
    // loadProfile();
    axios.get(load_profile_url).then(function (r) {
      let profile = r.data.profile;
      page.vue.user_email = profile.user_email;
      page.vue.creation_date = profile.creation_date;
      page.vue.logs = profile.caches_logged;
      page.vue.hides = profile.caches_hidden;
      page.vue.banner_URL = '..' + profile.banner_path; // Should change this
      page.vue.profile_pic_URL = '..' + profile.profile_photo_path; // Should change this
    });
  };

  // Call to the initializer.
  page.init();
};

// This takes the (empty) page object, and initializes it,
// putting all the code i
init(page);
