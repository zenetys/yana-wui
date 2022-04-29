<template>
    <div v-if="$route.name !== 'ViewSwitch' && $route.name !== 'ViewHost'">
        <ViewInventoryDevices v-if="$store.getters.storeInventoryMode === 'devices'" />
        <ViewInventoryFdb v-if="$store.getters.storeInventoryMode === 'fdb'" />
    </div>
    <div v-else>
        <router-view></router-view>
    </div>
</template>

<script>
import ViewInventoryDevices from '@/views/ViewInventoryDevices.vue';
import ViewInventoryFdb from '@/views/ViewInventoryFdb.vue';

export default {
    name: 'ViewInventory',
    components: {
        ViewInventoryDevices,
        ViewInventoryFdb,
    },
};
</script>
