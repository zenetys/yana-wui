<template>
    <div>
        <v-col cols="12" sm="12" md="6" lg="6" xl="6" class="pt-0 pl-0">
            <h2 class="pb-6">OUI lookup tool</h2>
            <div class="pb-2">Enter MAC addresses or prefixes to lookup vendors.<br/></div>
            <div class="pb-1 text-caption font-weight-bold">Examples:</div>
            <div class="pb-8 text-body-2 font-weight-light">08:00:20<br/>98:FA-9B-63-0C-C4<br/>00d9.d110.21f9<br/></div>
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
                v-model="ouiSearch"
                ></v-textarea>
            <v-btn
                color="#17B8CE"
                class="white--text"
                @click="_onOuiLookupClick()">
                Find
            </v-btn>
            <div class="ouiResult pt-8">
                <template v-if="typeof ouiResult == 'object'">
                    <table>
                        <tr v-for="(v, k) in ouiResult" :key="k">
                            <td class="pr-2">{{ k }}</td>
                            <td>{{ v }}</td>
                        </tr>
                    </table>
                </template>
                <template v-else>
                    <p>{{ ouiResult }}</p>
                </template>
            </div>
        </v-col>
    </div>
</template>

<style scoped>
::v-deep .v-textarea * {
    background: #e8e8e8d6 !important;
}
::v-deep .v-textarea textarea {
    line-height: 1.4em;
    font-weight: 300;
    height: 110px;
}
</style>

<script>
import axios from 'axios';

export default {
    name: 'ViewOui',
    data() {
        return {
            ouiSearch: '',
            ouiResult: '',
        }
    },
    methods: {
        _onOuiLookupClick() {
            if (!this.ouiSearch) {
                this.ouiResult = 'Please enter MAC addresses to search';
                return;
            }

            axios({
                method: 'get',
                url: '/oui',
                params: {
                    q: this.ouiSearch,
                },
                timeout: 5000,
                responseType: 'json'
            })
                .then((response) => {
                    if (this.isEmptyObject(response.data))
                        this.ouiResult = 'Nothing found';
                    else
                        this.ouiResult = response.data;
                })
                .catch((e) => {
                    this.ouiResult = e.toString();
                });

            this.ouiResult = 'Searching, please wait...';
        },
        isEmptyObject(o) {
            for (let i in o)
                return false;
            return true;
        },

    },
}
</script>
