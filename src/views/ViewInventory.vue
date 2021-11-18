<template>
    <div>
        <div>
            <ViewInventoryDevices/>
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
