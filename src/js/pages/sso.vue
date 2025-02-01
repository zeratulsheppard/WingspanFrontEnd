<script>
  import { mapActions } from 'vuex';
  import axios from 'axios';

  export default {
    computed: {
      sso() {
        return this.$route.hash
          .substring(1)
          .split('&')
          .reduce((obj, keyValue) => {
            const [key, value] = keyValue.split('=');
            obj[key] = value;
            return obj;
          }, {});
      },
    },
    methods: {
      ...mapActions(['trackUserId']),
      async fetchCharId() {
        try {
          const { data } = await axios.get('https://esi.evetech.net/verify/', {
            headers: {
              Authorization: `Bearer ${this.sso.access_token}`,
            },
          });
          await this.trackUserId(data.CharacterID);
          this.$router.push({ name: 'root' });
        } catch (error) {
          console.error('Error fetching character ID:', error);
        }
      },
    },
    created() {
      this.fetchCharId();
    },
  };
</script>

<template>
  <div class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
    Redirecting...
  </div>
</template>
