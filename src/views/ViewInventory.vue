<template>
  <div v-if="this.$route.name !== 'ViewSwitch' && this.$route.name !== 'ViewHost'">
    <ViewInventoryDevices v-if="this.$store.getters.storeInventoryMode === 'devices'" />
    <ViewInventoryFdb v-if="this.$store.getters.storeInventoryMode === 'fdb'" />
  </div>
  <div v-else>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ViewInventoryDevices from '../views/ViewInventoryDevices.vue';
import ViewInventoryFdb from './ViewInventoryFdb.vue';

export default {
  name: 'ViewInventory',
  components: {
    ViewInventoryDevices,
    ViewInventoryFdb,
  },
  computed: {
    ...mapGetters(['storeEntity']),
  },
  beforeMount() {
    /* redirect to the entity-picker if none is set, at least for now */
    if (!this.storeEntity) this.$router.push('/entity-picker');
  },
};
</script>
