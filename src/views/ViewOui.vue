<template>
    <v-row no-gutters>
        <v-col cols="12" sm="11" md="7" lg="6" xl="5">
            <h2 class="pb-6">OUI lookup tool</h2>
            <div>Enter MAC addresses or prefixes to lookup vendors:</div>
            <v-form ref="ouiForm" lazy-validation>
                <v-textarea
                    v-model="ouiSearch"
                    placeholder="08:00:20
98-FA-9B-63-0C-C4
00d9.d110.21f9
..."
                    :rules="ouiRules"
                    :spellcheck="false"
                    dense
                    class="pb-4"
                />
                <v-btn
                    @click="onOuiSubmit"
                    color="#17B8CE"
                    class="white--text"
                >Find</v-btn>
            </v-form>
            <div class="pt-8">
                <table v-if="typeof ouiMessage === 'object'">
                    <tr v-for="(subMessage, subMessageKey) in ouiMessage" :key="subMessageKey">
                        <td class="pr-2">{{ subMessageKey }}</td>
                        <td>{{ subMessage }}</td>
                    </tr>
                </table>
                <p v-else>{{ ouiMessage }}</p>
            </div>
        </v-col>
    </v-row>
</template>

<style scoped>
::v-deep textarea {
    line-height: 1.4em;
    font-weight: 300;
    height: 110px;
    background: #fcfcfc;
}
</style>

<script>
export default {
    name: 'ViewOui',
    data() {
        return {
            ouiSearch: '',
            ouiMessage: '',
            ouiRules: [
                (x) => (x ?? '').length > 0 ||
                    'MAC addresses or prefixes required',
            ],
        };
    },
    methods: {
        /**
         * Initiate a OUI search query from the API.
         */
        async onOuiSubmit() {
            if (!this.$refs.ouiForm.validate())
                return;

            const errorContext = 'Could not complete OUI lookup.';
            const searchOptions = {
                params: {
                    q: this.ouiSearch,
                },
                timeout: 5000,
            };

            this.ouiMessage = 'Searching, please wait...';

            const result = await this.$api.get('/oui', errorContext, searchOptions);

            if (this.$utils.isEmptyObject(result)) {
                this.ouiMessage = 'Nothing found';
            } else {
                this.ouiMessage = result;
            }
        },
    },
    watch: {
        /**
         * If this component was triggered by the global search menu,
         * set its value in the textarea and submit straight.
         */
        '$route.query.search': {
            immediate: true,
            handler() {
                if (!this.$route.params._fromSearchMenu ||
                    (this.$route.query.search ?? '') === '')
                    return;
                this.ouiSearch = this.$route.query.search;
                this.$nextTick(() => { this.onOuiSubmit(); });
            },
        }
    },
};
</script>
