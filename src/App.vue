<template>
    <v-app>
        <Message />
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<style lang="scss">
html {
    overflow-y: auto !important;
}
* {
    transition: none !important;
}
a {
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
}
.nowrap {
    white-space: nowrap;
}
</style>

<script>
import Message from '@/components/Message.vue';

export default {
    name: 'App',
    components: {
        Message,
    },
    data: () => ({}),
    methods: {
        onWindowKeyDown(event) {
            if (event.ctrlKey && event.shiftKey && event.key === 'F')
                this.$ev.$emit('ctrl-shift-f', event);
        }
    },
    mounted() {
        window.addEventListener('keydown', this.onWindowKeyDown);
    },
    destroyed() {
        window.removeEventListener('keydown', this.onWindowKeyDown);
    },
};
</script>
