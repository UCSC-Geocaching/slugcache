import InputPassword from "./InputPassword.js";
import { buildPath } from "../utils.js";

export default {
    name: "FormLogin",
    inject: ["baseURL"],
    components: {
        InputPassword
    },
    data() {
        return {
            email: "",
            password: "",
            isValidCredentials: true,
        };
    },
    template: /*html*/ `
    <form @submit.prevent="login" novalidate v-cloak>
      <div class="field">
        <div class="control has-icons-left">
          <input
            class="input"
            type="email"
            placeholder="Email Address"
            autocomplete="email"
            required v-model="email"
            :class="{ 'is-danger': !isValidCredentials }">
          <span class="icon is-small is-left">
            <i class="fa fa-fw fa-envelope-o"></i>
          </span>
        </div>
      </div>
      <div class="field">
        <input-password :is-danger="!isValidCredentials" v-model="password" />
        <p v-if="!isValidCredentials" class="help is-danger">Incorrect email or password. Please try again.</p>
        <button class="button is-ghost" type="button" @click="openForgotPwModal" style="padding-left: 0rem;">Forgot Password?</button>
      </div>
      <button class="button is-fullwidth is-warning" type="submit">Login</button>
    </form>
    `,
    methods: {
        login() {
            axios
                .post(buildPath(this.baseURL, "auth/api/login"), {
                    email: this.email,
                    password: this.password,
                })
                .then((resp) => {
                    this.isValidCredentials = true;
                    const next = new URLSearchParams(location.search).get("next") || buildPath(this.baseURL, "map");
                    window.location.replace(next);
                })
                .catch((err) => (this.isValidCredentials = false));
        },
        openForgotPwModal() {
            this.$parent.$parent.openForgotPwModal();
        }
    },
    mounted() {
        this.isValidCredentials = true;
    }
};
