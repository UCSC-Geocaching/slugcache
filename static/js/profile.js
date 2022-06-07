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
    first_name: '',
    last_name: '',
    creation_date: '',
    logs: 0,
    hides: 0,
    banner_URL: '',
    profile_pic_URL: '',
    activities: [],
    hidden_caches: [],
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
    // load_profile: Loads the profile details from the users db.
    load_profile: function () {
      axios.get(load_profile_url).then(function (r) {
        let profile = r.data.profile;
        let date_string = profile.creation_date.replace(' ', 'T');
        page.vue.user_email = profile.user_email;
        page.vue.first_name = profile.first_name;
        page.vue.last_name = profile.last_name;
        date = new Date(date_string);
        page.vue.creation_date = `${
          date.getMonth() + 1
        }/${date.getDate()}/${date.getFullYear()}`;
        page.vue.banner_URL = '..' + profile.banner_path; // Should change this
        page.vue.profile_pic_URL = '..' + profile.profile_photo_path; // Should change this
      });
    },

    // load_activity: Loads the activity feed with the most recent activity
    load_activity: function () {
      axios.get(load_activity_url).then(function (r) {
        // Update the logs statistic
        page.vue.logs = r.data.activities.length;
        // Reverse chronological order
        tmp_activities = r.data.activities.reverse();
        // Format the dates
        tmp_activities.forEach((activity) => {
          tmp_date = new Date(activity.discover_date.replace(' ', 'T'));
          activity.discover_month = tmp_date.getMonth() + 1;
          activity.discover_day = tmp_date.getDate();
          activity.discover_year = tmp_date.getFullYear();
        });
        // Get only the 8 most recent activities
        tmp_activities.length = Math.min(tmp_activities.length, 8);
        page.vue.activities = tmp_activities;
      });
    },

    // load_hidden_caches: Loads and displays caches hidden by the user
    load_hidden_caches: function () {
      axios.get(load_hidden_caches_url).then(function (r) {
        // Update the hides statistic
        page.vue.hides = r.data.caches.length;
        page.vue.hidden_caches = r.data.caches;
      });
    },
  };

  // This creates the Vue instance.
  page.vue = new Vue({
    el: '#vue-target',
    data: page.data,
    methods: page.methods,
    created: function () {
      this.load_profile();
      this.load_activity();
      this.load_hidden_caches();
    },
  });
};

// This takes the (empty) page object, and initializes it,
// putting all the code i
init(page);
