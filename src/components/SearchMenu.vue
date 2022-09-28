<template>
    <div class="search-menu">
        <v-text-field
            ref="refSearch"
            :value="searchValue"
            placeholder="Search..."
            prepend-inner-icon="mdi-magnify"
            :hide-details="true"
            :spellcheck="false"
            clearable
            dense
            @keydown.up.prevent="onSearchArrowUpDown(-1);"
            @keydown.down.prevent="onSearchArrowUpDown(1);"
            @keyup.left="onSearchFocus();"
            @keyup.right="onSearchFocus();"
            @keyup.enter.prevent="onSearchSubmit();"
            @keyup.escape.prevent="onSearchBlur();"
            @input="onSearchInput"
            @click="onSearchFocus();"
            @focus="onSearchFocus();"
            @blur="onSearchBlur(); blur();"
        />

        <span v-show="searchValue.length == 0" class="shortcut">
            {{ shortcutText }}
        </span>

        <v-list v-show="showMenu" dense elevation="10">
            <v-list-item-group :value="selectedEntryIndex" color="primary">
                <!-- handler on @mousedown replaces @click because it fires before @blur -->
                <v-list-item
                    v-for="(entry, i) in entries"
                    :key="i"
                    :disabled="isDisabledMenuEntry(entry)"
                    @mouseover="onMenuSelect(i);"
                    @mousedown="onMenuSelect(i); onSearchSubmit();"
                >
                    <v-list-item-icon>
                        <v-icon small>{{ entry.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title v-if="searchValue.length > 0">
                            search <span class="value">&quot;{{ searchValue }}&quot;</span>
                        </v-list-item-title>
                        <v-list-item-title v-else>
                            everything
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                        <small>in {{ entry.label }} &nbsp;&nbsp;&crarr;</small>
                    </v-list-item-action>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </div>
</template>

<style scoped>
.shortcut {
    position: absolute;
    right: 6px;
    top: 9px;
    color: #b1b1b1;
    font-size: 0.6rem;
    z-index: -1;
}

.search-menu {
    /* Position the container relative to be able to remove the menu list
     * child from the flow with a position absolute. */
    position: relative;
}
.search-menu .v-list {
    background-color: #fcfcfc;
    padding: 0;
    /* Postion in absolute to remove the menu list from the flow so that
     * it renders above whatever content is displayed bellow the search
     * input. */
    margin-top: 1px;
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    z-index: 1;
}
.search-menu .v-list-item {
    min-height: inherit;
}
.search-menu .v-list-item__title {
    font-weight: inherit;
}
.search-menu .v-list-item__title .value {
    font-weight: 500;
}
.search-menu .v-list-item__icon {
    height: inherit;
    margin-right: 0.2rem;
}
.search-menu .v-list-item__action {
    margin-top: 0;
    margin-bottom: 0;
    border: 1px solid lightgrey;
    border-radius: 5px;
    padding: 0px 5px;
    background-color: white;
    color: black;
    /* The corner rounded label displayed on the right side of list items
     * goes above the items. That way we get to see the white background. */
    z-index: 1;
}
.search-menu .v-list-item--disabled .v-list-item__icon,
.search-menu .v-list-item--disabled .v-list-item__action {
    opacity: 0.38;
}
</style>

<script>
export default {
    name: 'SearchMenu',
    props: {
        entries: {
            type: Array,
            required: true,
        },
        value: {
            type: String,
            required: false,
        },
        shortcutText: {
            type: String,
            required: false,
        }
    },
    data: () => ({
        searchValue: '',
        selectedEntryIndex: undefined,
        showMenu: false,
    }),
    methods: {
        /* @public */
        focus() {
            console.log('SearchMenu: focus: triggering input focus');
            this.$refs.refSearch.focus();
        },
        /* @public */
        blur() {
            console.log('SearchMenu: blur: triggering input blur');
            this.$refs.refSearch.blur();
        },

        onSearchArrowUpDown(offset) {
            function getNext(val, offset, size) {
                if (val === undefined)
                    val = offset > 0 ? -1 : size;
                let next = (val + offset) % size;
                return (next >= 0) ? next : size + next;
            }
            /* arrow notation function to keep this */
            const doMoveSelectedEntry = () => {
                for (let i = 0, candidateEntry = this.selectedEntryIndex;
                     offset && i < this.entries.length; /* ignore offset == 0 */
                     i++)
                {
                    /* goto next entry */
                    candidateEntry = getNext(candidateEntry, offset, this.entries.length);
                    if (!this.isDisabledMenuEntry(this.entries[candidateEntry])) {
                        this.selectedEntryIndex = candidateEntry;
                        break;
                    }
                    /* skip disabled entries in same direction with a try step of 1 */
                    offset = offset > 0 ? 1 : -1;
                }
            }
            /* Move selected entry only if the menu is displayed. Otherwise,
             * just open "as is" without changing the selected entry. */
            if (this.showMenu)
                doMoveSelectedEntry();
            this.showMenu = true;
        },
        onSearchInput(newSearchValue) {
            /* A click on the clear icon triggers this event with a null value
             * as argument. In this case, update the search value to an empty
             * string and submit straight. */
            this.searchValue = newSearchValue ?? '';
            if (newSearchValue === null) {
                this.onSearchSubmit();
                return;
            }

            /* If no menu entry is currently selected, find the best match and
             * select it. Disabled menu entry will be skipped. */
            if (this.selectedEntryIndex === undefined)
                this.selectedEntryIndex = this.findBestMenuEntryFromRoute();
            /* Otherwise a menu entry is already selected but it may just have
             * been disabled. In such case, just unselect it. */
            else if (this.isDisabledMenuEntry(this.entries[this.selectedEntryIndex]))
                this.selectedEntryIndex = undefined;

            this.showMenu = true;
        },
        onSearchSubmit() {
            const entry = this.entries[this.selectedEntryIndex];
            console.log('SearchMenu: onSearchSubmit: selectedEntryIndex =', this.selectedEntryIndex);
            console.log('SearchMenu: onSearchSubmit: entry =', entry);
            if (entry) {
                console.log('SearchMenu: onSearchSubmit: emit submit');
                this.$emit('submit', this.searchValue, entry);
                this.showMenu = false; /* could do this.blur() to loose focus */
            }
        },
        onSearchFocus() {
            this.showMenu = true;
        },
        onSearchBlur() {
            this.showMenu = false;
        },
        onMenuSelect(entryIndex) {
            this.selectedEntryIndex = entryIndex;
        },

        isDisabledMenuEntry(entry) {
            return !entry.route || entry.route.name === undefined ||
                (entry.empty === false && this.searchValue.length === 0);
        },

        findBestMenuEntryFromRoute(route = this.$route) {
            var bestEntryIndex = undefined;
            for (let iMatched = route.matched.length - 1; iMatched >= 0; iMatched--) {
                const menuMatch = this.findMenuEntryFromRoute(route.matched[iMatched], route.query);
                if (menuMatch !== undefined) {
                    bestEntryIndex = menuMatch;
                    break;
                }
            }
            console.log('SearchMenu: findBestMenuEntryFromRoute: best index =', bestEntryIndex);
            return bestEntryIndex;
        },
        findMenuEntryFromRoute(route, query) {
            for (let iEntry = 0; iEntry < this.entries.length; iEntry++) {
                if (this.isDisabledMenuEntry(this.entries[iEntry]) ||
                    this.entries[iEntry].route.name !== (route.name ?? route.meta?.assumeRouteName))
                    continue;
                const queryParams = Object.keys(this.entries[iEntry].route.query ?? {});
                const queryMatch = queryParams.every((param) => (this.entries[iEntry].route.query[param] === query[param]));
                if (queryMatch)
                    return iEntry;
            }
            return undefined;
        },
    },
    watch: {
        entries: {
            immediate: true,
            handler(current) {
                console.log('SearchMenu: watch/$props.entries: current =', current);
            },
        },
        value: {
            immediate: true,
            handler(current) {
                console.log('SearchMenu: watch/$props.value: current =', current);
                this.searchValue = current ?? '';
            },
        },
        '$route': {
            immediate: true,
            handler(current) {
                console.log('SearchMenu: watch/$route: current =', current);
                this.selectedEntryIndex = this.findBestMenuEntryFromRoute(current);
            },
        },
    },
};
</script>
