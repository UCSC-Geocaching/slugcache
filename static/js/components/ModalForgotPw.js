import { buildPath } from "../utils.js";

export default {
    name: "ModalForgotPw",
    inject: ["baseURL"],
    props: {
        route: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            email: "",
            isValidEmail: true,
            canShowSuccess: false
        };
    },
    template: /*html*/ `
    <div>
      <component :is="'style'" type="text/css">
        .modal-req-reset-pw-title {
          line-height: initial;
        }

        .delete {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
      </component>

      <div class="modal is-active">
        <div class="modal-background" @click="close"></div>
        <div class="modal-content">
          <div class="box">
            <button class="delete" @click="close"></button>
            <div class="block">
              <h1 class="modal-req-reset-pw-title title has-text-left">Need help with your password?</h1>
              <p class="subtitle has-text-left">Tell us some information about your account.</p>
            </div>
            <div class="block">
              <form @submit.prevent="requestResetPassword" novalidate v-cloak>
                <div class="field">
                  <div class="control has-icons-left">
                    <input
                      class="input"
                      type="email"
                      placeholder="Email Address"
                      autocomplete="email"
                      required v-model="email"
                      :class="{ 'is-danger': !isValidEmail }"
                    >
                    <span class="icon is-small is-left">
                      <i class="fa fa-fw fa-envelope-o"></i>
                    </span>
                  </div>
                  <p v-if="!isValidEmail" class="help is-danger">Invalid email. Please try again.</p>
                  <p v-if="canShowSuccess" class="help is-success">Success! Visit the link sent to your email.</p>
                </div>
                <button class="button is-fullwidth gold-button" type="submit">Continue</button>
              </form>
            </div>
            <div class="block"></div>
          </div>
        </div>
      </div>
    </div>
    `,
    methods: {
        requestResetPassword() {
            axios
                .post(buildPath(this.baseURL, "auth/api/request_reset_password"), {
                    "email": this.email,
                    "route": "custom_auth"
                })
                .then(resp => {
                    this.isValidEmail = true;
                    this.canShowSuccess = true;
                })
                .catch(err => {
                    this.isValidEmail = false;
                    this.canShowSuccess = false;
                });
        },
        close() {
            this.$emit("close");
        }
    },
    mounted() {
        this.isValidEmail = true;
    }
};
