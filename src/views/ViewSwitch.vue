<template>
    <div>
        <table class="device-info mb-3">
            <tbody>
                <tr>
                    <th class="text-left px-2">Name</th>
                    <td class="text-left pl-2">
                        <router-link :to="'/main/inventory/host/'+this.device.id" id="device-name">{{ this.deviceName }}</router-link>
                        <span class="name2">{{ this.deviceSecondaryNames ? ', ' + this.deviceSecondaryNames : '' }}</span>
                    </td>
                </tr>
                <tr class="">
                    <th class="text-left px-2">Description </th>
                    <td class="text-left pl-2">{{ this.deviceDescription }}</td>
                </tr>
                <tr>
                    <th class="text-left px-2">IP </th>
                    <td class="text-left pl-2">{{ this.deviceIp }}</td>
                </tr>
            </tbody>
        </table>

        <AutoTable
            id="table-switch"
            :pagination="false"
            :api="apiUrl"
            array-data=""
            height="auto"
            :auto-table-height-extra="[-120]"
            :column-definition="columnDefinition"
            :item-class="itemClass"
             />
    </div>
</template>

<style scoped>
table.device-info {
    font-size: 12.8px;
    border-collapse: collapse;
    line-height: 1.4;
}

table.device-info th {
    border-right: thin solid rgba(0, 0, 0, 0.12);
    background-color: #FCFCFC !important;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 700;
}

table.device-info span.name2 {
    color: #666;
}

::v-deep #table-switch tr:not(.status-up---up) td {
    color: #aaa;
}

::v-deep .level-1 {
    /* orange */
    background-color: #FFE4A8 !important;
    border-color: #F2DFAB !important;
}
::v-deep .level-2 {
    /* red */
    background-color: #FAC8D1 !important;
    border-color: #EBBFBB !important;
}

::v-deep .col_peers .mdi:not(.cp-span) {
    color: #1eb8ce;
}

.device-info th {
    vertical-align: top;
}
</style>

<script>
import AutoTable from "@/components/AutoTable";
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
    name: 'SwitchView',
    components: {
        AutoTable,
    },
    data() {
        return {
            // deviceInfo: {},
            columnDefinition: {
                did: {
                    hidden: true,
                },
                dname: {
                    hidden: true,
                },
                hwAddr: {

                },
                name: {

                },
                description: {
                    tdClass: (v, o) => this.getTdClass('description', v, o),
                    tdTooltip: (v, o) => this.getTdTooltip('description', v, o),
                },
                status: {
                    tdClass: (v, o) => this.getTdClass('status', v, o),
                    tdTooltip: (v, o) => this.getTdTooltip('status', v, o),
                },
                speed: {
                    tdClass: (v, o) => this.getTdClass('speed', v, o),
                    tdTooltip: (v, o) => this.getTdTooltip('speed', v, o),
                },
                group: {

                },
                mode: {
                    tdClass: (v, o) => this.getTdClass('mode', v, o),
                    tdTooltip: (v, o) => this.getTdTooltip('mode', v, o),
                },
                pvlan: {
                    tdClass: (v, o) => this.getTdClass('pvlan', v, o),
                    tdTooltip: (v, o) => this.getTdTooltip('pvlan', v, o),
                },
                untagged: {
                    tdClass: (v, o) => this.getTdClass('untagged', v, o),
                    tdTooltip: (v, o) => this.getTdTooltip('untagged', v, o),
                },
                tagged: {
                    tdClass: (v, o) => this.getTdClass('tagged', v, o),
                    tdTooltip: (v, o) => this.getTdTooltip('tagged', v, o),
                    style: () => {
                        return 'white-space: normal;';
                    },
                },
                peers: {
                    style: () => {
                        return 'white-space: normal;'
                    },
                    format: (v) => {
                        let out = [];
                        if (v) {
                            for (let i of v) {
                                var label = i.label;
                                if (i.type && i.type.indexOf('switch') > -1) {
                                    if (i.id)
                                        label = `<a href="#/main/inventory/switch/${i.id}">${label}</a>`;
                                    label='<span class="mdi mdi-swap-horizontal-bold"></span> '+label;
                                }

                                let tab = [];
                                for (let j in i) {
                                    if (j!='label' && j!='id') {
                                        tab.push(j+': '+ i[j]);
                                    }
                                }
                                out.push( '<span class="nowrap" title="'+ tab.join('\n') +'">' + label + '</span>');
                            }
                        }
                        return out.join(', ');
                    },
                    html: true,
                },
                _meta: {
                    hidden: true,
                },
            },
            tableHeight: 0,
            device: {},
        }
    },
    computed: {
        apiUrl() {
            return '/entity/' + encodeURIComponent(this.storeEntity) + '/' +
                'interfaces?database=' + encodeURIComponent(this.storeDatabase) +
                '&id=' + encodeURIComponent(this.$route.params.id);
        },
        ...mapGetters([
            'storeDatabase',
            'storeEntity',
            'storeSearch',
        ]),
        deviceName() {
            return Array.isArray(this.device.name)
                ? this.device.name[0] : this.device.name;
        },
        deviceSecondaryNames() {
            if (Array.isArray(this.device.name) && this.device.name.length > 1)
                return this.device.name.slice(1).join(', ');
            return '';
        },
        deviceDescription() {
            return Array.isArray(this.device.description)
                ? this.device.description[0] : this.device.description;
        },
        deviceIp() {
            return Array.isArray(this.device.ip)
                ? this.device.ip.join(', ') : this.device.ip;
        }
    },
    methods: {
        getDeviceInfo() {
            let url = '/entity/' + encodeURIComponent(this.storeEntity) + '/' +
                'devices?database=' + encodeURIComponent(this.storeDatabase) +
                '&id=' + encodeURIComponent(this.$route.params.id);
            axios({
                method: 'get',
                url: url,
            }).then( (response) => {
                this.device = response.data;
            }).catch((error) => {
                console.log(error);
                this.$store.commit('EDIT_STORE_INFO_MESSAGE', {type: 'error', content: 'Cannot load device informations, problem with the query.', error: error });
            });
        },
        itemClass(item) {
            let classz = '';
            if (item.status)
                classz+='status-'+item.status.toLowerCase().replace(/[^a-z0-9]/g, '-');
            return classz;
        },
        getTdClass(k, v, o) {
            if (o._meta && o._meta[k])
                return 'level-' + o._meta[k].level; /* may give undefined */
            return '';
        },
        getTdTooltip(k, v, o) {
            if (o._meta && o._meta[k] && o._meta[k].text) {
                if (Array.isArray(o._meta[k].text))
                    return o._meta[k].text.join('\n');
                else
                    return o._meta[k].text;
            }
            return '';
        },
    },
    watch: {
        /* FIXME: workaround bug on entity change
         * also add redirect to inventory main view on search
         * this is probably not the right way to do it, need to check */
        storeEntity() { this.$router.push('/main/inventory'); },
        storeSearch() { this.$router.push('/main/inventory'); },
        '$route.params.id': function () { this.getDeviceInfo(); },
    },
    beforeMount() {
        /* redirect to the entity-chooser if none is set, at least for now */
        if (!this.storeEntity)
            this.$router.push('/entity-chooser');
    },
    mounted() {
        this.getDeviceInfo();
    },
    updated() {
        window.dispatchEvent(new Event('resize'));
    },
}
</script>
