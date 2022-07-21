<template>
  <base-section class="pa-0">
    <v-container class="page-secretive-olive-wonyoung pa-0">
      <v-sheet max-width="780px" class="mx-auto event-image-container">
        <router-link :to="link">
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/376/wonyoung_promotion_01.gif"
          />
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/377/wonyoung_promotion_02.jpg"
          />
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/378/wonyoung_promotion_03.jpg"
          />
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/379/wonyoung_promotion_04.jpg"
          />
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/380/wonyoung_promotion_05.gif"
          />
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/381/wonyoung_promotion_06.jpg"
          />
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/382/wonyoung_promotion_07.jpg"
          />
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/383/wonyoung_promotion_08.jpg"
          />
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/384/wonyoung_promotion_09.jpg"
          />
        </router-link>
        <a href="https://pf.kakao.com/_bWigK" target="_blank">
          <v-img
            src="https://cdn.winc.app/uploads/ppb/file/file/385/wonyoung_promotion_10.jpg"
          />
        </a>
      </v-sheet>
    </v-container>
    <event-page-collection
      :prop-products="eventPageProducts"
      collection-name="secretive-olive"
    ></event-page-collection>
  </base-section>
</template>

<script>
import CustomerHelper from '@/mixins/CustomerHelper';
import BaseSection from '@/components/Section';
import EventPageCollection from '@/views/customer/collections/components/EventPageCollection';

export default {
  name: 'CustomerPagesSecretiveOliveWonyoung',
  components: {
    BaseSection,
    EventPageCollection,
  },
  data: () => {
    return {};
  },
  mixins: [CustomerHelper],
  computed: {
    link() {
      return '/collections/secretive-olive';
    },
    eventPageProducts() {
      return this.getProductsByCollectionHandle('secretive-olive');
    },
  },
};
</script>

<style lang="scss"></style>
