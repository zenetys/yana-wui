<template>
    <div>
        <v-overlay :value="snackbarIsDisplayed" :z-index="99" :opacity="0.5" color="#ffffff" @click="closeSnackbar()">
            <v-snackbar
                :timeout="-1"
                v-model="snackbarIsDisplayed"
                :color="messageColor"
                :elevation="5"
                style="white-space: pre-line"
                centered
                ref="messageOverlay"
                id="messageSnackbar">
                <span class="message"> {{ messageContent }} </span>
                <template v-slot:action="{ attrs }">
                    <v-btn icon v-bind="attrs" top @click="closeSnackbar()">
                        <v-icon class="message">mdi-close</v-icon>
                    </v-btn>
                </template>
            </v-snackbar>
        </v-overlay>
    </div>
</template>

<style lang="scss">
.message {
    color: rgba(0, 0, 0, 0.87) !important;
}
</style>

<script>
export default {
    name: 'Message',
    props: {},
    data() {
        return {
            snackbarIsDisplayed: false,
            snackbarTimeOut: 5000,
        };
    },
    computed: {
        message: {
            get() {
                return this.$store.getInfoMessage();
            },
            set(newMessage) {
                this.$store.setInfoMessage(newMessage);
            },
        },
        messageColor() {
            switch (this.message.type) {
                case 'error':
                    return '#FFADAD';
                case 'info':
                    return 'primary';
                case 'warning':
                    return 'orange lighten-4';
                default:
                    return 'primary';
            }
        },
        messageContent() {
            return this.message.content + (this.message.error ? '\nError detail: ' + this.message.error.message : '');
        },
    },
    watch: {
        message() {
            if (Object.keys(this.message).length !== 0) {
                this.snackbarIsDisplayed = true;
            } else {
                this.snackbarIsDisplayed = false;
            }
        },
    },
    methods: {
        closeSnackbar() {
            this.snackbarIsDisplayed = false;
            this.message = {};
        },
        closeSnackbarOnWindowKeyUp(e) {
            if (e.key === 'Escape') this.closeSnackbar();
        },
    },
    mounted() {
        window.addEventListener('keyup', this.closeSnackbarOnWindowKeyUp);
    },
    destroyed() {
        window.removeEventListener('keyup', this.closeSnackbarOnWindowKeyUp);
    },
};
</script>
