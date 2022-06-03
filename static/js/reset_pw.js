import InputPassword from './components/InputPassword.js';
import { buildPath } from './utils.js';

new Vue({
  el: '#reset-pw',
  components: {
    InputPassword,
  },
  data: {
    password: '',
    password2: '',
    error: '',
    isReset: false
  },
  methods: {
    resetPw() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token') || '';
      axios
        .post(buildPath(baseURL, 'auth/api/reset_password'), {
          'token': token,
          'new_password': this.password,
          'new_password2': this.password2
        })
        .then(resp => {
          this.isReset = true;
          this.error = '';
        })
        .catch(err => {
          const errors = err.response.data.errors;
          // at the time this was written py4web will only return 1 error for this api endpoint
          this.error = Object.values(errors)[0];
          this.isReset = false;
        });
    }
  },
  computed: {
    hasError() {
      return this.error !== '';
    }
  }
});
