<template>
    <div>
        <!-- ================== NAV BAR ============== -->
        <v-app-bar app elevation="0" height="48">
            <v-toolbar-title>
                <router-link to="/">
                    <img
                        class="py-1 pl-0 d-flex justify-start align-center"
                        src="assets/images/zenetys-fg-black-bg-full-transparent_LD.png"
                        height="40"
                    />
                </router-link>
            </v-toolbar-title>
            <v-spacer></v-spacer>

            <v-btn
                @click="setEntityPickerDisplayMode(entityPickerDisplayMode)"
                icon
                fab
                dark
                x-small
                color="primary"
                class="view-type-button"
            >
                <v-icon dark v-if="entityPickerDisplayMode === 'grid'"> mdi-table </v-icon>
                <v-icon dark v-if="entityPickerDisplayMode === 'table'"> mdi-view-grid </v-icon>
            </v-btn>
        </v-app-bar>

        <!-- ================== MAIN CONTENT =========== -->
        <v-main class="pa-0">
            <v-container id="search-field">
                <v-row class="justify-center py-8">
                    <!-- Filter field -->
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field
                            v-model="entitySearch"
                            ref="entitySearch"
                            rounded
                            outlined
                            dense
                            prepend-inner-icon="mdi-magnify"
                            :hide-details="true"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-container>

            <!-- Message component -->
            <v-container>
                <v-row class="justify-center">
                    <Message />
                </v-row>
            </v-container>

            <v-container>
                <v-row class="row justify-center align-center">
                    <!-- Grid Display Mode -->
                    <template v-if="entityPickerDisplayMode === 'grid' && filteredEntities.length !== 0">
                        <!-- Entities -->
                        <v-col
                            :key="`entity-${entityIndex}`"
                            v-for="(entity, entityIndex) in filteredEntities"
                            cols="6"
                            sm="4"
                            md="3"
                            lg="2"
                            xl="1"
                        >
                            <router-link class="entity" :to="'/main'">
                                <v-card
                                    class="d-flex align-center justify-center px-3 entity-card"
                                    color="secondary"
                                    min-height="100"
                                    @click="updateStoreEntity(entity.name)"
                                >
                                    <v-card-actions>
                                        <span class="entity-name"> {{ entity.name }}</span>
                                    </v-card-actions>
                                </v-card>
                            </router-link>
                        </v-col>
                    </template>

                    <!-- Table Display Mode -->
                    <template v-if="entityPickerDisplayMode === 'table' && filteredEntities.length !== 0">
                        <!-- Entities -->
                        <v-col cols="12" sm="6" md="6" lg="4" xl="4">
                            <v-data-table
                                :headers="headers"
                                :items="filteredEntities"
                                class="elevation-2"
                                mobile-breakpoint="0"
                                width=""
                                :height="tableHeight"
                                fixed-header
                                :footer-props="entityTableProps.itemPerPageOptions"
                                :items-per-page="-1"
                            >
                                <template
                                    v-for="(header, headerIndex) in headers"
                                    v-slot:[`item.${header.value}`]="{ item }"
                                >
                                    <div :key="`entity-${headerIndex}`">
                                        <router-link :to="'/main'">
                                            <span v-if="header.value === 'name'" @click="updateStoreEntity(item.name)">
                                                {{ item.name }}
                                            </span>
                                        </router-link>
                                    </div>
                                </template>
                            </v-data-table>
                        </v-col>
                    </template>
                </v-row>
            </v-container>
        </v-main>
    </div>
</template>

<style lang="scss" scoped>
a {
    text-decoration: none;
}

.entity-card {
    &:hover {
        cursor: pointer;
        background-image: linear-gradient(to left bottom, rgba(16, 110, 132, 1), rgba(30, 184, 206, 1));
    }
    .entity-name {
        color: #ffffff;
        text-align: center;
    }
}

.view-type-button::before {
    background-color: transparent;
}
</style>

<script>
import Message from '@/components/Message.vue';
import * as queries from '@/plugins/queries';
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'ViewEntityPicker',
    components: {
        Message,
    },
    data() {
        return {
            headers: [{ text: 'Entity Name', value: 'name' }],
            entityPickerDisplayMode: 'grid',
            entitySearch: '',
            entityTableProps: {
                itemPerPageOptions: { 'items-per-page-options': [10, 20, -1] },
            },
            tableHeight: 0,
        };
    },
    computed: {
        ...mapGetters(['storeEntities']),
        filteredEntities() {
            return this.storeEntities
                .map((entity) => ({ name: entity }))
                .filter((el) => el.name.toLowerCase().includes(this.entitySearch.toLowerCase()));
        },
    },
    methods: {
        ...mapActions(['updateStoreEntity', 'updateStoreSearch']),
        setEntityPickerDisplayMode(type) {
            this.entityPickerDisplayMode = type === 'table' ? 'grid' : 'table';
        },
        setTableHeight() {
            const header = document.querySelector('header');
            const searchField = document.getElementById('search-field');
            if (header && searchField) {
                this.tableHeight = window.innerHeight - (header.clientHeight + searchField.clientHeight + 136);
            }
        },
    },
    mounted() {
<<<<<<< HEAD
        if (this.storeEntities.length === 0) queries.fetchUpdateStoreEntities();
=======
        if (this.storeEntities.length === 0)
            queries.fetchUpdateStoreEntities();
>>>>>>> deef2823b16654fae164907d9d94de3823611777
        this.setTableHeight();
        this.$refs.entitySearch.$refs.input.focus();
        window.addEventListener('resize', this.setTableHeight);
        this.updateStoreSearch('');
    },
    destroyed() {
        window.removeEventListener('resize', this.setTableHeight);
    },
};
</script>
