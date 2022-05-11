<!-- 토스트 : 말 그대로 토스트 기계에서 토스트 구운 것처럼 툭 튀어 올라왔다 내려가는 팝업임. -->
<template>
  <v-snackbar v-model="isShowing" :timeout="timeout" style="bottom: 3%;">
    {{ message }}
  </v-snackbar>
</template>

<script>
import { get } from 'vuex-pathify';

export default {
  name: 'Toast',

  data: () => {
    return {
      isShowing: false,
      message: '',
      timeout: 1000,
    };
  },

  computed: {
    // hasMessages: get('toast/hasMessages'),
    messageCount: get('toast/messageCount'),
  },

  methods: {
    showMessage() {
      this.$store.dispatch('toast/popMessage').then(m => {
        this.message = m;
        this.isShowing = true;
      });
    },
  },

  watch: {
    messageCount(val) {
      if (val > 0) {
        this.showMessage();
      }
    },
  },

  created() {
    if (this.messageCount > 0) {
      this.showMessage();
    }
  },
};
</script>

<style scoped></style>
