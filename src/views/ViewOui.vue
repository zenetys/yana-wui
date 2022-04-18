<template>
    <v-col cols="12" sm="12" md="6" lg="6" xl="6" class="pt-0 pl-0">
        <h2 class="pb-6">OUI lookup tool</h2>
        <div class="pb-2">Enter MAC addresses or prefixes to lookup vendors.<br /></div>
        <div class="pb-1 text-caption font-weight-bold">Examples:</div>
        <div class="pb-8 text-body-2 font-weight-light">08:00:20<br />98:FA-9B-63-0C-C4<br />00d9.d110.21f9<br /></div>
        <h4>OUI search:</h4>
        <v-textarea
            solo
            dense
            DISABLEflat
            spellcheck="false"
            placeholder="00:00:00:00:00:00
11:11:11:11:11:11
..."
            class="pb-4"
            hide-details="true"
            v-model="ouiSearch"></v-textarea>
        <v-btn color="#17B8CE" class="white--text" @click="handleOuiLookupClick()"> Find </v-btn>
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
import { isEmptyObject } from '@/plugins/utils';
export default {
    name: 'ViewOui',
    data() {
        return {
            ouiSearch: '',
            ouiMessage: '',
        };
    },
    methods: {
        handleOuiLookupClick() {
            if (!this.ouiSearch) {
                this.ouiMessage = 'Please enter MAC addresses to search';
                return;
            } else {
                const searchOptions = {
                    params: {
                        q: this.ouiSearch,
                    },
                    timeout: 5000,
                };

                this.$api
                    .get('/oui', searchOptions)
                    .then((response) => {
                        if (isEmptyObject(response.data)) {
                            this.ouiMessage = 'Nothing found';
                        } else {
                            this.ouiMessage = response.data;
                        }
                    })
                    .catch((e) => {
                        this.ouiMessage = e.toString();
                    });

                this.ouiMessage = 'Searching, please wait...';
            }
        },
    },
};
</script>
