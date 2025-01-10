<template>
  <div v-if="haveOauth">
    <div class="separator">{{ $t("login.or") }}</div>
    <div class="row q-px-md q-gutter-y-sm q-pa-lg">
      <div class="row col-5"></div>
      <Glogin />
      <div class="row col-5"></div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

import Oauth from "./google/Signin.vue";

export default {
  components: {
    Oauth,
  },
  data() {
    return {
      googleClientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
    };
  },
  computed: {
    haveOauth() {
      return this.googleClientId;
    },
  },
};
</script>
