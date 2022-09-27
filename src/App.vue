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
            if (event.ctrlKey && event.shiftKey && event.key === 'F') {
                console.log('App: onWindowKeyDown: ctrl-shift-f:', event)
                this.$ev.$emit('ctrl-shift-f', event);
                return;
            }
            if (event.ctrlKey && event.key.toUpperCase() === 'A') {
                console.log('App: onWindowKeyDown: ctrl-a:', event)
                this.$ev.$emit('ctrl-a', event);
                return;
            }
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
