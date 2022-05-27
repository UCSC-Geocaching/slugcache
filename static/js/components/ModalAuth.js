import FormLogin from "./FormLogin.js";
import FormRegister from "./FormRegister.js";

export default {
    name: "ModalAuth",
    components: {
        FormLogin,
        FormRegister
    },
    props: {
        route: {
            type: String,
            required: true
        }
    },
    template: /*html*/ `
    <div>
      <component :is="'style'" type="text/css">
        .modal h1.title {
          margin: 0rem;
          line-height: initial;
        }
        .delete {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
        nav {
          position: relative;
        }
        nav:after {
          content: '';
          width: 100%;
          height: 1px;
          background-color: hsl(0, 0%, 96%);
          position: absolute;
          bottom: 0.06rem;
          z-index: -999;
        }
        .login-btn {
          padding-left: 0rem;
          padding-right: 1rem;
        }
        .signup-btn {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        a.navbar-item {
          padding-left: 0rem;
          padding-right: 0rem;
        }
      </component>
  
      <div class="modal is-active">
        <div class="modal-background" @click="close"></div>
        <div class="modal-content">
          <div class="box">
            <h1 class="title has-text-centered">
              {{ isLoginRoute ? 'Login to Geocache' : 'Join Geocache Today' }}
            </h1>
            <button class="delete" @click="close"></button>
            <div class="block">
              <nav class="navbar">
                <div class="navbar-brand">
                  <div class="login-btn">
                    <a class="navbar-item is-tab"
                       :class="{ 'is-active': isLoginRoute }"
                       @click="login">
                      <strong>Login</strong>
                    </a>
                  </div>
                  <div class="signup-btn">
                    <a class="navbar-item is-tab"
                       :class="{ 'is-active': !isLoginRoute }"
                       @click="register">
                      <strong>Sign Up</strong>
                    </a>
                  </div>
                </div>
              </nav>
            </div>
            <div class="block">
              <form-login v-if="isLoginRoute"></form-login>
              <form-register v-else></form-register>
            </div>
            <div class="block"></div>
          </div>
        </div>
      </div>
    </div>
    `,
    methods: {
        login() {
            const baseURL = this.route.slice(0, this.route.lastIndexOf("/"));
            this.$emit("update:route", `${baseURL}/login`);
        },
        register() {
            const baseURL = this.route.slice(0, this.route.lastIndexOf("/"));
            this.$emit("update:route", `${baseURL}/register`);
        },
        close() {
            this.$emit("close");
        }
    },
    computed: {
        isLoginRoute() {
            const routes = this.route.split("/");
            return routes[routes.length - 1] === "login";
        }
    }
};
