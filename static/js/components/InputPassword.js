export default {
    name: "InputPassword",
    data() {
        return {
            type: "password",
            isHovered: false
        };
    },
    props: {
        placeholder: {
            type: String,
            default: "Password"
        },
        isDanger: {
            type: Boolean,
            default: false
        }
    },
    template: /*html*/ `
        <div class="control has-icons-left has-icons-right">
          <input 
            class="input"
            :type="type"
            :placeholder="placeholder"
            autocomplete="current-password"
            required
            :class="{ 'is-danger': isDanger }"
            @input="$emit('input', $event.target.value)"
          >
          <span class="icon is-small is-left">
            <i class="fa fa-fw fa-lock"></i>
          </span>
          <span
            class="icon is-small is-right"
            style="pointer-events: auto; cursor: pointer;"
            :style="'filter: brightness(' + brightness + ')'"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            @click="toggleVisibility"
          >
            <i class="fa fa-fw" :class="isVisible ? 'fa-eye-slash' : 'fa-eye'"></i>
          </span>
        </div>
    `,
    methods: {
        toggleVisibility() {
            this.type = this.type === "password" ? "text" : "password";
        }
    },
    computed: {
        isVisible() {
            return this.type === "text";
        },
        brightness() {
            return this.isHovered ? "80%" : "100%";
        }
    }
};
