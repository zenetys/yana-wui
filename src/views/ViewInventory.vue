<template>
    <div>
        <div v-if="this.$route.name!='ViewSwitch' && this.$route.name!='ViewHost'">
            <ViewInventoryDevices/>
        </div>
        <div v-else>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ViewInventoryDevices from '../views/ViewInventoryDevices.vue'

export default {
    name: 'ViewInventory',
    components: {
        ViewInventoryDevices,
    },
    computed: {
        ...mapGetters([
            'storeEntity',
        ]),
    },
    beforeMount() {
        /* redirect to the entity-chooser if none is set, at least for now */
        if (!this.storeEntity)
            this.$router.push('/entity-chooser');
    }
}
</script>
