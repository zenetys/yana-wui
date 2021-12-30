<template>
    <div>
        <v-row>
            <v-col cols="6">
                <v-card :height="cardHeight" id="host-card">
                    <table class="device-info mb-3">
                        <tbody>
                            <tr v-for="(item, index) in device" :key="item.id">
                                <template v-if="index!='iface'">
                                    <th class="text-left px-2">{{index.charAt(0).toUpperCase() + index.slice(1)}}</th>
                                    <td class="text-left px-2" :id="'device-'+index">
                                        <!-- Array -->
                                        <template v-if="Array.isArray(item)">
                                            <!-- Array and not object -->
                                            <template v-if="!checkIfObject(item[0])">
                                                <div>
                                                    <div class="">{{item[0]}} <v-icon v-if="item.length>1" size="18" class="icon-chevron" @click="openExpand(index)">mdi-chevron-down</v-icon> </div>
                                                    <div v-if="item[0]" :class="'expand_panel__'+index" class="">
                                                        <template v-for="(element, index) in item">
                                                            <p class="mb-0" v-if="index!=0" :key="element+`-${index}`">{{element}}</p>
                                                        </template>
                                                    </div>
                                                </div>
                                            </template>
                                            <!-- Array and object -- route -->
                                            <template v-if="checkIfObject(item[0]) && index=='route'">
                                                <div>
                                                    dest {{item[0].dest}}
                                                    <template v-if="item[0].via">
                                                        via {{item[0].via}}
                                                    </template>
                                                    <template v-if="item[0].iface">
                                                        dev {{item[0].iface}}
                                                    </template>
                                                    <v-icon v-if="item.length>1" size="18" class="icon-chevron" @click="openExpand(index)">mdi-chevron-down</v-icon>
                                                </div>
                                                <div v-if="item[0]" :class="'expand_panel__'+index">
                                                    <template v-for="(element, index) in item">
                                                        <template v-if="index!=0">
                                                            <p :key="index" class="mb-0">
                                                                dest {{element.dest}}
                                                                <template v-if="element.via">
                                                                    via {{element.via}}
                                                                </template>
                                                                <template v-if="element.iface">
                                                                    dev {{element.iface}}
                                                                </template>
                                                            </p>
                                                        </template>
                                                    </template>
                                                </div>
                                            </template>
                                            <!-- Array and object -- vlan -->
                                            <template v-if="checkIfObject(item[0]) && index=='vlan'">
                                                <div class="">{{item[0].id}} {{item[0].name}} <v-icon v-if="item.length>1" size="18" class="icon-chevron" @click="openExpand(index)">mdi-chevron-down</v-icon> </div>
                                                <div :class="'expand_panel__'+index">
                                                    <template v-for="(element, index) in item">
                                                        <p class="mb-0" v-if="index!=0" :key="index">{{element.id}} {{element.name}}</p>
                                                    </template>
                                                </div>
                                            </template>
                                        </template>
                                        <!-- Not Array -->
                                        <template v-else>
                                            <template v-if="!checkIfObject(item)">
                                                <span>{{item}}</span>
                                            </template>
                                        </template>
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card :height="cardHeight" id="host-ifaces-card" class="">
                    <table class="table-iface">
                        <tbody>
                            <tr>
                                <th rowspan="2"></th>
                            </tr>
                            <tr>
                                <th v-for="element in ifaceHeaderArray" :key="element">{{element}}</th>
                            </tr>
                            <tr v-for="(element, i) in iface" :key="i">
                                <th>{{element.name}}</th>
                                <template v-for="item in ifaceHeaderArray">
                                    <td v-if="item!='ip'" :class="cellClass(element[item], item)" :key="item.id">{{cellContent(element, item)}}</td>
                                    <td v-else :class="'cell-'+item" :key="item.id">{{ formatIfaceIp(element.name) }}</td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </v-card>
            </v-col>
        </v-row>

    </div>
</template>

<style lang="scss" scoped>
    * {
        font-size: 12.8px;
    }

    .cell-green {
        // background-color: #a2d6b8;
        background-color: #B1E8B6;
    }

    .cell-red {
        // background-color: #f9cecc;
        background-color: #FAC8D1;
    }

    .cell-ip {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    #host-card, #host-ifaces-card{
        overflow-y: auto;
    }

    th {
        vertical-align: top;
    }

    // host table
    #host-ifaces-card {
        
        table {
            font-size: 12.8px;
            width: 99.99%;
            overflow: auto;
            display: block;
            white-space: nowrap;
            border-collapse: collapse;
        }

        tr td:last-child {
            width: 1%;
        }

        td {
            text-align: left;
            padding: 1px 5px 1px 5px;
            box-sizing: border-box;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            box-shadow: inset 0 -1px 0 rgb(0 0 0 / 12%);
            box-shadow: inset 1px -1px 0 rgb(0 0 0 / 12%);
        }

        // Header left
        table > tbody > tr > th:nth-child(1) {
            left: 0;
            text-align: left;
            vertical-align: middle;
            padding-left: 5px;
            padding-right: 15px;
            color: rgba(0, 0, 0, 0.6);
            background: #FCFCFC;
            box-shadow: inset 0px -1px rgb(0 0 0 / 12%);
        }

        // Header top
        table > tbody > tr:nth-child(2) > th {
            position: sticky;
            position: -webkit-sticky;
            top: 0;
            padding: 5px;
            z-index: 7;
            color: rgba(0, 0, 0, 0.6);
            text-align: left;
            background: #FCFCFC;
            box-shadow: inset 0 -1px 0 rgb(0 0 0 / 12%);
            box-shadow: inset 1px -1px 0 rgb(0 0 0 / 12%);
            box-sizing: border-box;
        }

        // top left cell
        table > tbody > tr:nth-child(1) > th {
            position: sticky;
            position: -webkit-sticky ;
            top: 0;
            left: 0;
            // z-index: 8;
            background: rgb(255, 255, 255);
        }
    }

    ::v-deep .v-expansion-panels {
        z-index: inherit;

        .v-expansion-panel-header {
            padding-left: 0px;
            padding-top: 0px;
        }
    }

    .device-info th {
        background-color: #FCFCFC !important;
        color: rgba(0, 0, 0, 0.6);
    }

    .accordion {
        cursor: pointer;
    }

    .ifaces, .iface-row {
        background-color: #f1f1f1 !important;
    }

    .icon-chevron, .icon-chevron:focus {
        position: relative;
        vertical-align: top;
        background-color: none !important;
    }

    .expand_panel {
        &__ip, &__mac {
            display: none;
        }
    }
</style>

<script>
import axios from "axios";
import { mapGetters } from "vuex";

export default {
    name: 'ViewHost',
    components: {
    },
    data() {
        return {
            device: {},
            iface: {},
            columnDefinition: {},
            show: false,
            cardHeight: 0,
            ifaceHeaderArray: ['status', 'speed', 'hwAddr', 'ip'],
        }
    },
    computed: {
        ...mapGetters([
            'storeDatabase',
            'storeEntity',
            'storeSearch',
        ]),
    },
    watch: {
        /* FIXME: workaround bug on entity change
         * also add redirect to inventory main view on search
         * this is probably not the right way to do it, need to check */
        storeEntity() { this.$router.push('/main/inventory'); },
        storeSearch() { this.$router.push('/main/inventory'); },
        '$route.params.id': function () { this.getDeviceInfo(); },
    },
    methods: {
        getDeviceInfo() {
            let deviceUrl = '/entity/' + encodeURIComponent(this.storeEntity) + '/' +
                'devices?database=' + encodeURIComponent(this.storeDatabase) +
                '&id=' + encodeURIComponent(this.$route.params.id);
            let ifaceUrl = '/entity/' + encodeURIComponent(this.storeEntity) + '/' +
                'interfaces?database=' + encodeURIComponent(this.storeDatabase) +
                '&id=' + encodeURIComponent(this.$route.params.id);

            axios.all([axios.get(deviceUrl), axios.get(ifaceUrl)])
                    .then(axios.spread((deviceResult, ifaceResult) => {
                        console.log(deviceResult, ifaceResult);
                        this.device = deviceResult.data;
                        if (this.device.vlan) {
                            this.device.vlan = Object.values(this.device.vlan);
                        }
                        this.iface = ifaceResult.data;
                    }))
                    .catch((error) => {
                        console.log(error);
                        this.$store.commit('EDIT_STORE_INFO_MESSAGE', {type: 'error', content: 'Can not load host informations, problem with the query.', error: error });
                    });
        },
        setCardHeight() {
            let hostCard = document.getElementById('host-card');
            const extraHeight = 120;
            if (hostCard) {
                let hostCardRect = hostCard.getBoundingClientRect();
                this.cardHeight = window.innerHeight - hostCardRect.top - extraHeight;
            }

        },
        /**
         * Expand information panel for the targeted item
         * @param {string} val - The item object key label
         */
        openExpand(val) {
            let expandedPanel = document.querySelector('.expand_panel__'+val);
            if (expandedPanel) {
                const displayValue = window.getComputedStyle(expandedPanel).getPropertyValue('display');
                if (displayValue=='block') {
                    expandedPanel.style.display = "none";
                } else if (displayValue=='none') {
                    expandedPanel.style.display = "block";
                }
            }
        },
        checkIfObject(item) {
            return typeof item === 'object';
        },
        /**
         * Return the cell's color
         * @param {string} element - Object's key value
         * @param {string} item - Object's key label
         * @returns {string} Cell's color
         */
        cellClass(element, item) {
            if (element && item=='status') {
                if (element.includes('down')) {
                    return 'cell-red';
                } else {
                    return 'cell-green';
                }
            }
        },
        cellContent(element, item) {
            return element[item];
        },
        /**
         * Return the ip list
         * @param {string} ifname - Element name
         * @returns {string|array} The equivalent ip format
         */
        formatIfaceIp(ifname) {
            if (this.device.iface && this.device.iface[ifname] && this.device.iface[ifname].ip)
                return Array.isArray(this.device.iface[ifname].ip)
                    ? this.device.iface[ifname].ip.join(', ')
                    : this.device.iface[ifname].ip;
            return '';
        },
    },
    mounted() {

        this.getDeviceInfo();
        this.setCardHeight();
        window.addEventListener('resize', this.setCardHeight);
    },
    destroyed() {
        window.removeEventListener('resize', this.setCardHeight);
    }
}
</script>