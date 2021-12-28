<template>
    <div>
        <v-overlay :value="snackbar" :z-index="99" :opacity="0.5" color="#ffffff" @click="closeSnackbarOnButtonClick()">
            <v-snackbar
                :timeout="-1"
                v-model="snackbar"
                :color="messageColor"
                :elevation="5"
                style="white-space: pre-line;"
                centered
                ref="messageOverlay"
                id="messageSnackbar"
            >
                <span class="message"> {{this.message.content + (this.message.error ? ('\nError detail: '+this.message.error.message) : '')}} </span>
                <template v-slot:action="{ attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        top
                        @click="closeSnackbarOnButtonClick()"
                        >
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
import { mapState } from 'vuex';

export default {
    name: 'Message',
    props: {
    },
    data() {
        return {
            snackbar: false,
            snackbarTimeOut: 5000,
        }
    },
    computed: {
        ...mapState({
            message: 'storeInfoMessage'
        }),
        messageColor() {
            if (this.message.type=='error') {
                return '#FFADAD';
            } else if (this.message.type=='info') {
                return 'primary';
            } else if (this.message.type=='warning') {
                return 'orange lighten-4';
            }
            return 'primary';
        }
    },
    watch: {
        message() {
            if(Object.keys(this.message)!=0){
                this.snackbar = true;
            } else {
                this.snackbar = false;
            }
        }
    },
    methods: {
        closeSnackbarOnButtonClick() {
            this.snackbar = false;
            this.$store.commit('EDIT_STORE_INFO_MESSAGE', {});
        },
        closeSnackbarOnWindowKeyUp(e) {
            if (e.key == 'Escape')
                this.closeSnackbarOnButtonClick();
        }
    },
    mounted() {
        window.addEventListener('keyup', this.closeSnackbarOnWindowKeyUp);
    },
    destroyed() {
        window.removeEventListener('keyup', this.closeSnackbarOnWindowKeyUp);
    },
}
</script>