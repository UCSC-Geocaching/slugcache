import { buildPath } from '../utils.js';

export default {
  name: 'FormRegister',
  inject: ['baseURL', 'addUserURL'],
  data() {
    // using snake_case to make constructing POST request easier
    return {
      email: '',
      password: '',
      password_again: '',
      first_name: '',
      last_name: '',
      errors: {
        email: '',
        password: '',
        first_name: '',
        last_name: '',
      },
    };
  },
  template: /*html*/ `
    <form @submit.prevent="register" novalidate v-cloak>
      <!-- email address -->
      <div class="field">
        <div class="control has-icons-left">
          <input
            class="input"
            type="email"
            placeholder="Email Address"
            autocomplete="email"
            required
            v-model="email"
            :class="{ 'is-danger': errors.email !== '' }"
          />
          <span class="icon is-small is-left">
            <i class="fa fa-fw fa-envelope-o"></i>
          </span>
        </div>
        <p v-if="errors.email !== ''" class="help is-danger">{{errors.email}}</p>
      </div>
      <!-- password -->
      <div class="field">
        <div class="control has-icons-left">
          <input
            class="input"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            required
            v-model="password"
            :class="{ 'is-danger': errors.password !== '' }"
          />
          <span class="icon is-small is-left">
            <i class="fa fa-fw fa-lock"></i>
          </span>
        </div>
      </div>
      <!-- password (again) -->
      <div class="field">
        <div class="control has-icons-left">
          <input
            class="input"
            type="password"
            placeholder="Password (again)"
            autocomplete="current-password"
            required
            v-model="password_again"
            :class="{ 'is-danger': errors.password !== '' }"
          />
          <span class="icon is-small is-left">
            <i class="fa fa-fw fa-lock"></i>
          </span>
        </div>
        <p v-if="errors.password !== ''" class="help is-danger">
          {{errors.password}}
        </p>
      </div>
      <!-- first name -->
      <div class="field">
        <div class="control has-icons-left">
          <input
            class="input"
            type="text"
            placeholder="First Name"
            autocomplete="given-name"
            required
            v-model="first_name"
            :class="{ 'is-danger': errors.first_name !== '' }"
          />
          <span class="icon is-small is-left">
            <i class="fa fa-fw fa-user-o"></i>
          </span>
        </div>
        <p v-if="errors.first_name !== ''" class="help is-danger">
          {{errors.first_name}}
        </p>
      </div>
      <!-- last name -->
      <div class="field">
        <div class="control has-icons-left">
          <input
            class="input"
            type="text"
            placeholder="Last Name"
            autocomplete="family-name"
            required
            v-model="last_name"
            :class="{ 'is-danger': errors.last_name !== '' }"
          />
          <span class="icon is-small is-left">
            <i class="fa fa-fw fa-user-o"></i>
          </span>
        </div>
        <p v-if="errors.last_name !== ''" class="help is-danger">
          {{errors.last_name}}
        </p>
      </div>
      <button class="button is-fullwidth is-warning" type="submit">Sign Up</button>
    </form>
    `,
  methods: {
    async register() {
      if (this.password !== this.password_again) {
        this.errors.password = 'Not matching';
        return;
      }

      try {
        // Register with auth
        await axios
          .post(buildPath(this.baseURL, 'auth/api/register'), {
            email: this.email,
            password: this.password,
            first_name: this.first_name,
            last_name: this.last_name,
          });

        try {
          // Auto login on successful registration
          await axios
            .post(buildPath(this.baseURL, 'auth/api/login'), {
              email: this.email,
              password: this.password,
            });
          // Adding to "users" database
          // Must do this after login so we can get auth_user reference from session
          await axios
            .post(this.addUserURL, {
              first_name: this.first_name,
              last_name: this.last_name,
              email: this.email,
            });
        } catch (err) {
          this.setAllErrors('Internal Server Error');
          return;
        }
        
        const next =
          new URLSearchParams(location.search).get('next') ||
          buildPath(this.baseURL, 'map');
        window.location.replace(next);

        this.setAllErrors('');
      } catch(err) {
        const errors = err.response.data.errors || '';
        Object.keys(this.errors).forEach(
          (key) => (this.errors[key] = errors[key] || '')
        );
      }
    },
    setAllErrors(errMsg) {
      Object.keys(this.errors).forEach((key) => (this.errors[key] = errMsg));
    },
  },
  mounted() {
    this.setAllErrors('');
  },
};
