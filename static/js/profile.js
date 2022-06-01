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

  // This contains all the methods.
  page.methods = {
    // Complete as you see fit.
    // loadProfile: Loads the profile details from the users db.
    loadProfile: function () {
      axios.get(load_profile_url).then(function (r) {
        let profile = r.data.profile;
        let date_string = profile.creation_date.replace(' ', 'T');
        page.vue.user_email = profile.user_email;
        date = new Date(date_string);
        page.vue.creation_date = `${
          date.getMonth() + 1
        }/${date.getDate()}/${date.getFullYear()}`;
        page.vue.logs = profile.caches_logged;
        page.vue.hides = profile.caches_hidden;
        page.vue.banner_URL = '..' + profile.banner_path; // Should change this
        page.vue.profile_pic_URL = '..' + profile.profile_photo_path; // Should change this
      });
    },
  };

  // This creates the Vue instance.
  page.vue = new Vue({
    el: '#vue-target',
    data: page.data,
    methods: page.methods,
    created: function () {
      this.loadProfile();
    },
  });
};

// This takes the (empty) page object, and initializes it,
// putting all the code i
init(page);
