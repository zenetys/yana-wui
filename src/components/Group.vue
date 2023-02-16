<template>
    <section class="group flex-col end">
        <div class="group">
            <Port v-for="(port, i) in getPorts" :key="i" :port="port" :group="group" :isFirstLine="group.oneline || group.type === 'dual-lr' ? false : true" />
        </div>
        <div v-if="!group.oneline && group.type !== 'dual-lr'" class="group space">
            <Port v-for="(port, i) in getOtherPorts" :key="i" :port="port" :group="group" :isFirstLine="false" />
        </div>
    </section>
</template>

<script>
import Port from './Port.vue';

const leftToRight = (el, i, ports) => i < ports.length / 2;
const upToDown = (el, i) => i % 2 === 0;

export default {
    name: 'Group',
    components: {
        Port
    },
    props: {
        group: {
            type: Object,
        },
        ports: {
            type: Array,
        },
    },
    computed: {
        getPorts() {
            let ports = [];
            if (this.group.type === 'dual-lr') {
                // PUT SFP HERE SO ONLY ONE OF TWO PORTS IS SFP
                const res = this.ports.map(item => { return { ...item, type: "dual", sfp: true } });
                return [ ...this.ports, ...res ].sort((cur, next) => cur.index - next.index);
            }
            else if (this.group.type === 'dual-ud') {
                // PUTTING SFP OR DUAL IS USELSS THERE AS IT GETS FILTERED OUT
                const res = [ ...this.ports, ...this.ports ].sort((cur, next) => cur.index - next.index);
                return res.filter((el, i) => upToDown(el, i, ports));
            }
            if (this.group.oneline) {
                return this.ports;
            }
            else if (this.group.oneline && this.group.sfp) {
                return this.ports.map(item => { return { ...item, sfp: true } });
            }
            switch (this.group.numerotation) {
                case "left-right":
                    ports = this.ports.filter((el, i) => leftToRight(el, i, this.ports));
                    break;
                case "up-down":
                    ports = this.ports.filter((el, i) => upToDown(el, i, this.ports));
                    break;
                case "down-up":
                    ports = this.ports.filter((el, i) => !upToDown(el, i, this.ports));
                    break;
            }
            if (this.group.sfp) {
                ports = ports.map((item) => { return  { ...item, sfp: true } });
            }
            return ports;
        },

        getOtherPorts() {
            let ports = [];
            if (this.group.type === 'dual-ud') {
                // PUT SFP HERE SO ONLY ONE OF TWO PORTS IS SFP
                const res = this.ports.map(item => { return { ...item, type: "dual", sfp: true } });
                const ports = [ ...this.ports, ...res ].sort((cur, next) => cur.index - next.index);
                return ports.filter((el, i) => !upToDown(el, i, ports));
            }
            switch (this.group.numerotation) {
                case "left-right":
                    ports = this.ports.filter((el, i) => !leftToRight(el, i, this.ports));
                    break;
                case "up-down":
                    ports = this.ports.filter((el, i) => !upToDown(el, i, this.ports));
                    break;
                case "down-up":
                    ports = this.ports.filter((el, i) => upToDown(el, i, this.ports));
                    break;

            }
            if (this.group.sfp) {
                ports = ports.map((item) => { return  { ...item, sfp: true } });
            }
            return ports;
        }
    },
    methods: {
        isPortFirstLine(port, group) {
            const index = port.index
            group = {}
            if (group.oneline) return true

            if (group.numerotation === "up-down" || group.numerotation === "up-down-4") {
                return !(index % 2 === 0);
            }
            else if (group.numerotation === "down-up" || group.numerotation === "down-up-4") {
                return (index % 2 === 0);
            }
            else if (group.numerotation === "left-right" && group.type === "dual-ud") {
                return true
            }
            else if (group.numerotation === "left-right" && group.type === "dual-lr") {
                return false
            }
            else if (group.numerotation === "left-right" || group.numerotation === "left-right-4") {
                const total = group.to - group.from
                if (total <= 6) {
                    return true
                }
                return (index < group.to - total / 2);
            }
            return false
        }
    }
};
</script>
