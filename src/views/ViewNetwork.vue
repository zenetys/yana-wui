<template>
    <div>
        <div class="mb-3">

            <v-chip
                @click="filters.ll = !filters.ll"
                :input-value="true"
                :ripple="false"
                :color="filters.ll ? 'success' : 'error'"
                :filter-icon="filters.ll ? 'mdi-plus' : 'mdi-minus'"
                filter
                small
                outlined
            >
                LL 169.254.0.0/16
            </v-chip>
            <v-chip
                @click="filters.mbits = !filters.mbits"
                :input-value="true"
                :ripple="false"
                :color="filters.mbits ? 'success' : 'error'"
                :filter-icon="filters.mbits ? 'mdi-plus' : 'mdi-minus'"
                filter
                small
                outlined
            >
                mask bits &GreaterEqual;
                <v-text-field
                    v-model="filters.mbitsBound"
                    min="0"
                    max="32"
                    @click.stop
                    type="number"
                    class="z-filter-mbits"
                    hide-spin-buttons
                    hide-details dense solo flat
                />
            </v-chip>
            <v-chip
                @click="filters.pub = !filters.pub"
                :input-value="true"
                :ripple="false"
                :color="filters.pub ? 'success' : 'error'"
                :filter-icon="filters.pub ? 'mdi-plus' : 'mdi-minus'"
                filter
                small
                outlined
            >
                other than RFC 1918
            </v-chip>

        </div>
        <auto-table :config="config" >
            <template v-slot:render-cell-vlans="{ value }">
                <span v-for="(vlan, i) in value" :key="i" :title="vlan.name && vlan.name.join('\n')">
                    <span v-if="i > 0" class="z-vlan-sep">, </span>
                    <span class="z-vlan">
                        <router-link v-text="vlan.id" :to="{ name: 'ViewVlanMatrix', query: $route.query }" />
                        <span v-if="vlan.name && vlan.name.length > 0" class="z-vlan-name"> {{ vlan.name.join(', ') }}</span>
                    </span>
                </span>
            </template>
        </auto-table>
    </div>
</template>

<style scoped>
::v-deep .v-chip .v-icon {
    font-size: 20px;
}
.v-chip + .v-chip {
    margin-left: 10px;
}
.z-filter-mbits {
    padding-left: 4px;
    font-size: inherit;
}
.z-filter-mbits ::v-deep .v-input__slot {
    padding-left: 1px !important;
    padding-right: 1px !important;
    width: 1.1rem;
    background-color: #00000006 !important;
}
::v-deep .z-warning {
    background-color: #ffe4a8;
    border-color: #f2dfab;
}
::v-deep .z-critical {
    background-color: #fac8d1;
    border-color: #ebbfbb;
}
::v-deep #table-network .col_net,
::v-deep #table-network .col_mask {
    color: #666;
}
::v-deep #table-network .col_flag {
    color: #666;
}
.z-vlan-sep {
    padding-left: 2px;
    padding-right: 4px;
}
.z-vlan-name {
    padding-left: 4px;
    font-size: 0.65rem;
    color: #777;
}

/* default sizing */
::v-deep .sizable .col_flag {
    width: 1px; /* as small as possible */
}
::v-deep .sizable .col_net {
    width: 10%;
}
::v-deep .sizable .col_ipCount {
    width: 5%;
}
::v-deep .sizable .col_ipCountOtherFit {
    width: 5%;
}
::v-deep .sizable .col_ipUsage {
    width: 5%;
}
::v-deep .sizable .col_routers {
    min-width: 100px;
}
::v-deep .sizable .col_vlans {
    min-width: 100px;
}
</style>

<script>
import AutoTable from '@/components/AutoTable.vue';

/* ip lib */

function ipv4_bits2mask(bits /* assume int Number */) {
    const mask = [];
    for (let i = 1; i <= Math.floor(bits / 8); i++)
        mask.push(255);
    if (mask.length < 4)
        mask.push(256 - (1 << (8 - (bits % 8))));
    while (mask.length < 4)
        mask.push(0);
    return mask;
}

function ipv4_mask2bits(bytes /* assume array of int Number */) {
    const c = { "255": 8, "254": 7, "252": 6, "248": 5,
                "240": 4, "224": 3, "192": 2, "128": 1, "0": 0 }
    var p = 0, hasZeros = false;
    for (let m of bytes) {
        if (c[m] === undefined)
            return null;
        if (hasZeros && c[m] > 0)
            return null;
        if (c[m] < 8)
            hasZeros = true;
        p += c[m];
    }
    return p;
}

function ipv4_parse(input) {
    const bytes = (input) => {
        const bytes = input.split('.').map((x) => Number(x));
        for (let i = 0; i < bytes.length; i++) {
            if (isNaN(i) || i < 0 || i > 255)
                return null;
        }
        return bytes;
    };

    const cap = /^(?<ip>\d+\.\d+\.\d+\.\d+)(?<hasMask>\/((?<mbits>\d+)|(?<mask>\d+\.\d+\.\d+\.\d+)))?$/.exec(input);
    if (!cap)
        return null;

    const out = { raw: input };
    out.ip = bytes(cap.groups.ip);
    if (!out.ip)
        return null;
    if (!cap.groups.hasMask)
        cap.groups.mbits = 32;
    if (cap.groups.mbits) {
        out.mbits = Number(cap.groups.mbits);
        if (isNaN(out.mbits) || out.mbits < 0 || out.mbits > 32)
            return null;
        out.mask = ipv4_bits2mask(out.mbits);
    }
    else /*if (cap.groups.mask)*/ {
        out.mask = bytes(cap.groups.mask);
        if (!out.mask)
            return null;
        out.bits = ipv4_mask2bits(out.mask);
        if (out.bits === null)
            return null;
    }
    out.net = out.ip.map((x, i) => (x & out.mask[i]));
    return out;
}

function ipv4_isInNet(a, b) {
    if (typeof a == 'string')
        a = ipv4_parse(a);
    if (typeof b == 'string')
        b = ipv4_parse(b);
    if (!a || !b)
        return undefined;
    const shiftL = (x, y) => x << y >>> 0;
    const shiftR = (x, y) => y == 32 ? 0 : x >>> y;
    const aDec = shiftL(a.ip[0], 24) + shiftL(a.ip[1], 16) + shiftL(a.ip[2], 8) + (a.ip[3]);
    const bDec = shiftL(b.ip[0], 24) + shiftL(b.ip[1], 16) + shiftL(b.ip[2], 8) + (b.ip[3]);
    return shiftR(aDec, 32-b.mbits) == shiftR(bDec, 32-b.mbits) && a.mbits >= b.mbits;
}

const ipv4_priv10 = ipv4_parse('10.0.0.0/8');
const ipv4_priv172 = ipv4_parse('172.16.0.0/12');
const ipv4_priv192 = ipv4_parse('192.168.0.0/16');

function ipv4_isPrivate(x) {
    if (typeof x == 'string')
        x = ipv4_parse(x);
    return ipv4_isInNet(x, ipv4_priv10) ||
           ipv4_isInNet(x, ipv4_priv172) ||
           ipv4_isInNet(x, ipv4_priv192);
}

/* sort */

const { makeCmpMultiFn, makeCmpKey, makeCmpFn, cmpDefault, cmpFloat, cmpInt } = AutoTable.utils;

const cmpCidr = makeCmpMultiFn([
    /* put "other" row last when sorting asc: non integer last */
    { fn: makeCmpFn((e) => isNaN(parseInt(e)) ? 200 : 100), asc: 1 },
    { fn: cmpInt, asc: 1 },
]);

/* intermediate */

function getRarp2(devices, rarp) {
    const rarp2 = {}; // ip.mac.did = networks object pointer for fast lookup
    for (let ip in rarp) {
        for (let mac in rarp[ip]) {
            for (let device in rarp[ip][mac]) {
                if (!devices[device])
                    continue;
                if (!devices[device].iface[rarp[ip][mac][device]]?.net)
                    continue;
                rarp2[ip] ??= {};
                rarp2[ip][mac] ??= {};
                rarp2[ip][mac][device] = devices[device].iface[rarp[ip][mac][device]] /* has .net */;
            }
        }
    }
    return rarp2;
}

function getNetworksFromIface(devices, filters) {
    const out = {
        /* other for counting ips that does not fit anywhere */
        net: { other: { cidr: 'other', ipCount: 0 } },
        isIpCounted: {},
    };
    const pending = [];

    /* find network from interfaces, count interfaces ips */
    for (let device in devices) {
        for (let iface in (devices[device].iface || {})) {
            for (let ipcidr of (devices[device].iface[iface].ip || [])) {
                const parsedIp = ipv4_parse(ipcidr);
                if (!parsedIp || parsedIp.mbits === 0 || ipv4_isInNet(parsedIp, '127.0.0.0/8'))
                    continue;
                if (!filters.ll && ipv4_isInNet(parsedIp, '169.254.0.0/16'))
                    continue;
                if (!filters.mbits && parsedIp.mbits >= filters.mbitsBound)
                    continue;
                if (!filters.pub && !ipv4_isPrivate(parsedIp))
                    continue;

                if (parsedIp.mbits < 32) {
                    const net = parsedIp.net.join('.');
                    const cidr = `${net}/${parsedIp.mbits}`;
                    out.net[cidr] ??= { cidr, net, mbits: parsedIp.mbits,
                        mask: parsedIp.mask.join('.'), ipCount: 0, ipCountOtherFit: 0 };
                    out.net[cidr].ipCount++;
                    devices[device].iface[iface].net ??= {};
                    devices[device].iface[iface].net[cidr] = out.net[cidr];
                    out.isIpCounted[parsedIp.ip.join('.')] = 1;
                }
                else {
                    pending.push({ parsedIp, iface: devices[device].iface[iface] });
                }
            }
        }
    }

    /* count pending /32 like vips found on interfaces */
    for (let p of pending) {
        for (let net in p.iface.net) {
            if (ipv4_isInNet(p.parsedIp, net)) {
                p.iface.net[net].ipCount++;
                out.isIpCounted[p.parsedIp.ip.join('.')] = 1;
                break;
            }
        }
    }

    return out;
}

function fillRemaningIpsInNetworks(devices, rarp2, networks) {
    /* count ips from devices with no iface data, from rarp */
    function countFromRarp2(ip, did /* assume devices[did] exists */) {
        for (let mac of (devices[did].mac || [])) {
            for (let rarpDid in rarp2?.[ip]?.[mac]) {
                for (let net in rarp2[ip][mac][rarpDid].net) {
                    if (ipv4_isInNet(ip, rarp2[ip][mac][rarpDid].net[net].cidr)) {
                        rarp2[ip][mac][rarpDid].net[net].ipCount++;
                        networks.isIpCounted[ip] = 1;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    for (let device in devices) {
        for (let ip of (devices[device].ip || [])) {
            if (networks.isIpCounted[ip])
                continue;
            if (countFromRarp2(ip, device))
                continue;

            /* guess where it fits from known networks */
            const fitsIn = [];
            for (let net in networks.net) {
                if (ipv4_isInNet(ip, networks.net[net].cidr))
                    fitsIn.push(net);
            }
            if (fitsIn.length == 0) {
                networks.net.other.ipCount++;
                console.log(`ViewNetwork: getNetworks: ip ${ip} does not fit anywhere`);
            }
            else if (fitsIn.length == 1) {
                networks.net[fitsIn[0]].ipCount++;
                networks.isIpCounted[ip] = 1;
            }
            else /* fits in more than one network */
                fitsIn.forEach((net) => networks.net[net].ipCountOtherFit++)
        }
    }
}

function getRouters(devices, rarp2) {
    const routers = {};

    /* get routers ips from routes */
    for (let did in devices) {
        for (let route in (devices[did].route || {})) {
            const ip = devices[did].route[route].via;
            if (ip && /* dodgy data */ ip != '0.0.0.0' && ip != '127.0.0.1')
                routers[ip] = { ip };
        }
    }

    /* expand to all ips of matching devices
     * router capability (or type): don't known if it's actually enabled */
    for (let did in devices) {
        if (/*(devices[did].type && devices[did].type.indexOf('router') > -1) ||*/
            (devices[did].ip && devices[did].ip.find((ip) => routers[ip])))
            devices[did].ip.forEach((ip) => routers[ip] ??= { ip });
    }

    function getIfaceVlanId(ifnames) {
        for (let name of (ifnames ?? [])) {
            name = name.toLowerCase();
            const match = /^(vl(an(if)?)?|[a-z0-9/_-]+\.)(?<vlanId>\d+)$/.exec(name);
            if (match)
                return Number(match.groups.vlanId);
        }
        return undefined;
    }

    function addRouterVlan(ip, vlanId, weight) {
        routers[ip].vlan ??= {};
        routers[ip].vlan[vlanId] ??= { id: vlanId, weight: 0 };
        routers[ip].vlan[vlanId].weight += weight;
    }

    /* try to guess vlan id from routers interfaces names  */
    for (let did in devices) {
        if (!devices[did].ip || !devices[did].ip.find((ip) => routers[ip]))
            continue;

        for (let iface in devices[did].iface) {
            for (let cidr of (devices[did].iface[iface].ip || [])) {
                let ip = ipv4_parse(cidr);
                if (ip) {
                    ip = ip.ip.join('.');
                    routers[ip] ??= { ip };
                    const vlanId = getIfaceVlanId(devices[did].iface[iface].name);
                    if (vlanId)
                        addRouterVlan(ip, vlanId, Infinity);
                }
            }
        }
    }

    /* try to guess vlan ids from rarp interface names */
    for (let ip in routers) {
        for (let mac in rarp2?.[ip]) { /* ignore mac for now... */
            for (let rarpDid in rarp2[ip][mac]) {
                const oiface = rarp2[ip][mac][rarpDid];
                const vlanId = getIfaceVlanId(oiface.name);
                if (vlanId)
                    addRouterVlan(ip, vlanId, 1);
            }
        }
    }

    return routers;
}

function attachRoutersToNetworks(routers, networks) {
    for (let router in routers) {
        for (let net in networks.net) {
            if (ipv4_isInNet(router, net)) {
                routers[router].net ??= [];
                routers[router].net.push(networks.net[net]);
            }
        }
        if (routers[router].net) {
            routers[router].net.sort(makeCmpKey('mbits', -1, cmpDefault));
            const bestNet = routers[router].net[0];
            bestNet.routers ??= {};
            bestNet.routers[router] = routers[router];
            bestNet.vlans ??= {};
            for (let v in routers[router].vlan) {
                const rVlan = routers[router].vlan[v];
                if (!bestNet.vlans[v] || bestNet.vlans[v].weight < rVlan.weight)
                    bestNet.vlans[v] = rVlan;
            }
        }
    }

    for (let net in networks.net) {
        if (!networks.net[net].routers)
            continue;
        networks.net[net].routers = Object.keys(networks.net[net].routers);
        networks.net[net].routers.sort(cmpInt);
        networks.net[net].vlans = Object.values(networks.net[net].vlans);
        networks.net[net].vlans.sort(makeCmpKey('weight', -1, cmpDefault));
        networks.net[net].vlans = networks.net[net].vlans.map((e) => e.id);
    }
}

function getVlans2(vlans) {
    const vlans2 = {}; // id.name = { id, name, count }

    for (let odevice of vlans) {
        for (let ovlan of (odevice.vlan || [])) {
            vlans2[ovlan.id] ??= {};
            if (ovlan.name) {
                vlans2[ovlan.id][ovlan.name] ??= { id: ovlan.id, name: ovlan.name, count: 0 };
                vlans2[ovlan.id][ovlan.name].count++;
            }
        }
    }

    for (let vlanId in vlans2) {
        vlans2[vlanId] = Object.values(vlans2[vlanId]);
        vlans2[vlanId].sort(makeCmpKey('count', -1, cmpDefault));
        vlans2[vlanId] = vlans2[vlanId].map((o) => o.name);
    }

    return vlans2;
}

function attachVlansNameToNetworks(networks, vlans2) {
    for (let net in networks.net) {
        if (!networks.net[net].vlans)
            continue;
        networks.net[net].vlans = networks.net[net].vlans.map(
            (vlanId) => ({ id: vlanId, name: vlans2[vlanId] }));
    }
}

function attachIpUsageToNetworks(networks) {
    for (let net in networks.net) {
        const max = Math.pow(2, 32 - networks.net[net].mbits);
        const used = (networks.net[net].ipCount ?? 0) +
                     (networks.net[net].ipCountOtherFit ?? 0);
        if (max)
            networks.net[net].ipUsage = used*100/max;
    }
}

export default {
    name: 'ViewNetwork',
    components: {
        AutoTable,
    },
    data() {
        return {
            filters: {
                ll: false,
                mbits: false,
                mbitsBound: 30,
                pub: true,
            },
            config: {
                id: 'table-network',
                api: '',
                height: 'auto',
                paginated: false,
                heightOffsets: [-120],
                search: '',
                columns: {
                    flag: {
                        label: '',
                        formatHtml: (v, o) => o.cidr == 'other' ? '' : '<span class="mdi mdi-ip" />',
                        sortable: false,
                        truncable: false,
                        copyable: false,
                    },
                    cidr: {
                        sortable: cmpCidr,
                    },
                    net: {
                        sortable: cmpInt,
                    },
                    mbits: {
                        enabled: false,
                    },
                    ipCount: {
                        sortable: cmpInt,
                    },
                    ipCountOtherFit: {
                        sortable: cmpInt,
                    },
                    ipUsage: {
                        formatText: (v) => v && Math.round(v) + '%',
                        cssClass: (o) => {
                            if (o.ipUsage) {
                                if (o.ipUsage >= 80)
                                    return 'z-critical';
                                if (o.ipUsage >= 65)
                                    return 'z-warning';
                            }
                            return '';
                        },
                        sortable: cmpFloat,
                    },
                    routers: {
                        formatText: (v) => v && v.join(', '),
                        sortable: cmpInt,
                        order: 2000,
                    },
                    vlans: {
                        slotName: 'render-cell-vlans',
                        formatText: (input) => {
                            let out = '';
                            input?.forEach((vlan) => {
                                if (out.length > 0)
                                    out += ', ';
                                out += vlan.id;
                                if (vlan.name && vlan.name.length > 0)
                                    out += ' (' + vlan.name.join(', ') + ')'
                            });
                            return out;
                        },
                        cssClass: (o) => o.vlans && o.vlans.length > 1 ? 'z-warning' : '',
                        sortable: (a, b) => cmpInt(a?.[0]?.id, b?.[0]?.id),
                        order: 3000,
                    },
                },
            },
        };
    },
    methods: {
        buildData(devices, rarp, vlans) {
            const data = [];
            console.log('ViewNetwork: devices =', devices);

            const networks = getNetworksFromIface(devices, this.filters);
            const rarp2 = getRarp2(devices, rarp);
            fillRemaningIpsInNetworks(devices, rarp2, networks);
            const routers = getRouters(devices, rarp2);
            attachRoutersToNetworks(routers, networks);

            const vlans2 = getVlans2(vlans);
            attachVlansNameToNetworks(networks, vlans2);
            attachIpUsageToNetworks(networks);

            console.log('ViewNetwork: rarp2 =', rarp2);
            console.log('ViewNetwork: routers =', routers);
            console.log('ViewNetwork: networks =', networks);
            console.log('ViewNetwork: vlans2 =', vlans2);

            for (let net in networks.net)
                data.push({ flag: undefined, ...networks.net[net] });
            data.sort(makeCmpKey('cidr', 1, cmpCidr));
            return data;
        },
        getData(entity, database) {
            return Promise.all([
                this.$api.base.getDump(entity, database, 'sdevice', 'Could not get device data'),
                this.$api.base.getDump(entity, database, 'rarp', 'Could not get rarp data'),
                this.$api.base.getVlans(entity, database, 'Could not get vlan data'),
            ])
            .then(([devices, rarp, vlans]) => ({ data: this.buildData(devices, rarp, vlans) }));
            /* catch handled by autotable */
        },
    },
    computed: {
        apiStateParams() {
            return {
                entity: this.$route.query.entity,
                database: this.$route.query.db,
                filters: { ...this.filters },
            };
        },
    },
    watch: {
        apiStateParams: {
            immediate: true,
            handler(cur, prev) {
                console.log('ViewNetwork: watch/apiStateParams: cur =', cur, ', prev = ', prev);

                if (this.$utils.eq(cur, prev)) {
                    console.log('ViewNetwork: watch/apiStateParams: no change');
                    return;
                }
                if (!cur.entity || !cur.database) {
                    console.log('ViewNetwork: watch/apiStateParams: skip required data');
                    return;
                }

                this.config.api = this.getData(cur.entity, cur.database);
            },
        },
        '$route.query.search': {
            immediate: true,
            handler(cur) {
                this.config.search = cur;
            }
        },
    },
};
</script>
