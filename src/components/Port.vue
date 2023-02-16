<template>
    <article class="article margex"  :style="`${group.type === 'dual-lr' && port.type === 'dual' ? 'margin-right: 0.75rem' : ''} ${group.type === 'dual-ud' ? 'margin-right: 0.75rem' : ''}`">
        <p
            v-if="(isFirstLine && port.type !== 'dual') && group.type !== 'dual-ud'"
            class="text-center m-0" :style="isFirstLine ? 'margin-bottom: 0.25rem' : ''"
        >
            {{ group.type === 'console' ? '' : port.index }}
        </p>

        <div
            :class="`${portColors} ${!isFirstLine ? 'rotate' : ''} ${port.sfp ? 'sfp-port' : 'port'}`"
            :style="dualUdCss"
            :title="`${port.sfp ? 'SFP' : '' }\nName:  ${port.name}\nStatus: ${getPortStatus}`"
        >
            <div :class="`${portColors} ${port.sfp ? 'sfp-top' : 'top'}`"></div>
        </div>


        <p
            v-if="!isFirstLine || (isFirstLine && group.type === 'dual-ud')"
            :class="`${!isFirstLine ? 'mt-25' : ''} text-center m-0 index_${group.type}`"
            :style="`${(port.type !== 'dual' && group.type === 'dual-lr') || (port.type === 'dual' && group.type === 'dual-ud') ? 'display: none': ''}`"
        >
            {{ group.type === 'console' ? '' : port.index }}
        </p>
        <div v-if="port.type === 'dual'" :class="`${group.type === 'dual-lr' ? 'groupement' : 'groupement-ud'}`">
        </div>
    </article>
</template>

<style scoped>
.rotate {
    transform: rotateX(180deg);
}
.m-0 {
    margin:0;
}
.text-center {
    text-align: center;
}
.down {
    order: -1;
}
.bg-green {
    background-color: rgba(0, 255, 0, 1);
}
.mt-25 {
    margin-top: 0.25rem;
}
.port-bg-white {
    background-color: rgba(255, 255, 255, 1);
}
.port-bg-green {
    background-color: #11d36c;
}
.port-bg-grey {
    background-color: #a6aba6;
}
.margex {
    margin: 0 0.05rem;
}

.article {
    position: relative;
    min-width: 30px;
    height: 40px;
}
.port {
    position: relative;
    content: ' ';
    width: 30px;
    height: 20px;
    border: 2px solid rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
}
.top {
    content: ' ';
    width: 16px;
    height: 8px;
    position: absolute;
    top: -8px;
    left: 5px;
    border-right: 2px solid rgba(0, 0, 0, 0.2);
    border-top: 2px solid rgba(0, 0, 0, 0.2);
    border-left: 2px solid rgba(0, 0, 0, 0.2);
}

.sfp-port {
    position: relative;
    content: ' ';
    width: 30px;
    height: 22px;
    border: 2px solid rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
}
.sfp-top {
    content: ' ';
    width: 16px;
    height: 3px;
    position: absolute;
    top: -3px;
    left: 5px;
    border-right: 2px solid rgba(0, 0, 0, 0.2);
    border-top: 2px solid rgba(0, 0, 0, 0.2);
    border-left: 2px solid rgba(0, 0, 0, 0.2);
}
.groupement {
    position: absolute;
    content: '';
    width: 67px;
    height: 1rem;
    top: -10px;
    right: -4px;
    border-top: 2px solid rgb(239 232 0);
    border-right: 2px solid rgb(239 232 0);
    border-left: 2px solid rgb(239 232 0);
    pointer-events: none;
}

.groupement-ud {
    position: absolute;
    content: '';
    width: 2.25rem;
    height: 5rem;
    bottom: 0px;
    right: -5px;
    border: 2px solid rgb(239 232 0);
    pointer-events: none;
}
.index_dual-lr {
    position:absolute;
    right: 26px;
    top: 20px;
}


p {
    color: rgba(0, 0, 0, 0.45);
}

#console, #console div {
    background-color: #808080
}
</style>

<script>
export default {
    name: 'Port',
    props: {
        port: {
            type: Object,
        },
        group: Object,
        isFirstLine: Boolean,
    },
    computed: {
            dualUdCss() {
                 if (this.group.type === 'dual-ud' && this.isFirstLine) {
                     return 'margin-top: 1.15rem';
                 }
                 else if (this.group.type === 'dual-ud' && !this.isFirstLine) {
                     return 'margin-top: 0.45rem';
                 }
                 return '';
            },
            portColors() {
                if (this.port.name === 'Unknown')
                    return 'port-bg-grey';
                else if (this.port.operStatus === 1)
                    return 'port-bg-green';
                else
                    return 'port-bg-white';
            },
            getPortStatus() {
                if (this.port.name === 'Unknown')
                    return 'Unknown';
                else if (this.port.operStatus === 1)
                    return 'Up';
                else
                    return 'Down';
            }
    },
};
</script>
