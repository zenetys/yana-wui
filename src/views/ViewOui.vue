<template>
    <v-col cols="12" sm="12" md="6" lg="6" xl="6" class="pt-0 pl-0">
        <h2 class="pb-6">OUI lookup tool</h2>
        <div class="pb-2">Enter MAC addresses or prefixes to lookup vendors.<br /></div>
        <div class="pb-1 text-caption font-weight-bold">Examples:</div>
        <div class="pb-8 text-body-2 font-weight-light">08:00:20<br />98:FA-9B-63-0C-C4<br />00d9.d110.21f9<br /></div>
        <h4>OUI search:</h4>
        <v-textarea
            v-model="ouiSearch"
            placeholder="00:00:00:00:00:00
11:11:11:11:11:11
..."
            :spellcheck="false"
            :hide-details="true"
            solo
            dense
            DISABLEflat
            class="pb-4"
        />
        <v-btn
            @click="handleOuiLookupClick"
            color="#17B8CE"
            class="white--text"
        >Find</v-btn>
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
</template>

<style scoped lang="scss">
::v-deep .v-textarea * {
    background: #e8e8e8d6 !important;

    textarea {
        line-height: 1.4em;
        font-weight: 300;
        height: 110px;
    }
}
</style>

<script>
export default {
    name: 'ViewOui',
    data() {
        return {
            ouiSearch: '',
            ouiMessage: '',
        };
    },
    methods: {
        /**
         * Initiate a OUI search query from the API.
         */
        async handleOuiLookupClick() {
            if (!this.ouiSearch) {
                this.ouiMessage = 'Please enter MAC addresses to search';
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
};
</script>
