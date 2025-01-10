<template>
  <UserForm
    ref="userForm"
    :userFields="userFields"
    :contact="order.contact"
    @saved="goToNext"
  />
</template>

<script>
import { mapGetters } from "vuex";
import UserForm from "./User";

export default {
  components: {
    UserForm,
  },

  props: {
    signUpFields: {
      type: Object,
      required: true,
    },

    order: {
      type: Object,
      required: false,
      default: () => {
        return {
          address: {
            origin: {
              country: "",
              state: "",
              city: "",
              district: "",
              address: "",
              postalCode: "",
              street: "",
              number: "",
              complement: "",
            },
          },
          contact: {
            name: "",
            email: "",
            phone: "",
          },
        };
      },
    },
  },

  created() {
    if (this.isLogged() && this.logged.company === null) {
      this.current = "create_company";
    }
  },

  computed: {
    ...mapGetters({
      newUser: "auth/created",
      newCompany: "people/company",
      signUpCustomBg: "auth/signUpCustomBg",
      defaultCompany: "people/defaultCompany",
    }),

    logged() {
      return this.$store.getters["auth/user"];
    },

    userFields() {
      return this.signUpFields?.username || [];
    },

    companyFields() {
      return this.signUpFields?.company || [];
    },
  },

  watch: {
    newUser(user) {
      if (user && user.token) this.$emit("created", user);
    },

    newCompany(company) {
      if (company && company.id) this.$emit("company", company);
    },
  },

  data() {
    return {
      current: "create_user",
      steps: {
        create_user: {
          hasErrors: null,
        },
        create_company: {
          hasErrors: null,
        },
      },
    };
  },

  methods: {
    isLogged() {
      return (
        this.$store.getters["auth/user"] !== null &&
        this.$store.getters["auth/user"].username
      );
    },
    goToNext(formHasErrors) {
      this.steps[this.current].hasErrors = formHasErrors;

      // if has no errors

      if (!formHasErrors) {
        if (this.current == "create_user") {
          if (this.$store.getters["auth/created"] !== null) {
            if (this.$store.getters["auth/created"].company !== null) {
              this.$emit("registered");
              return;
            }
          }

          this.$refs.stepper.next();
        } else {
          if (this.current == "create_company") {
            this.$emit("registered");
          }
        }
      }
    },

    style() {
      if (this.background()) {
        return `
          background-image: url('${this.background()}');
        `;
      }
      return "";
    },

    background() {
      if (this.signUpCustomBg === true) {
        return (
          "//" +
          this.defaultCompany.theme.background.domain +
          this.defaultCompany.theme.background.url
        );
      } else if (typeof this.signUpCustomBg === "string") {
        return this.signUpCustomBg;
      }
      return null;
    },
  },
};
</script>

<style lang="stylus" scoped>
.signup-page
  background-position: center
  background-repeat  : no-repeat
  background-size    : cover
  padding-left       : 30px
  padding-right      : 30px

.signup-page-card
  width: 100%;

@media (max-width: $breakpoint-xs-max)
  .signup-page
    padding-left : 20px
    padding-right: 20px
</style>
