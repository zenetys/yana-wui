<template>
    <article class="article margex"  :style="`${group.type === 'dual-lr' && port.type === 'dual' ? 'margin-right: 0.75rem' : ''} ${group.type === 'dual-ud' ? 'margin-right: 0.75rem' : ''}`">
        <p
            v-if="(isFirstLine && port.type !== 'dual') && group.type !== 'dual-ud'"
            class="text-center m-0 font-small" :style="isFirstLine ? 'margin-bottom: 0.2rem' : ''"
        >
            {{ group.type === 'console' ? '' : port.index }}
        </p>

        <div
            :class="`${portColors} ${!isFirstLine ? 'rotate' : ''} ${port.sfp ? 'sfp-port' : 'port'}`"
            :style="portCss"
            :title="`${port.sfp ? 'SFP' : '' }\nName:  ${port.name}\nStatus: ${getPortStatus} \nVlan: ${ port.pvlan || 'None' }`"
        >
            <div
                :class="`${portColors} ${port.sfp ? 'sfp-top' : 'top'}`"
            >
            </div>
        </div>


        <p
            v-if="!isFirstLine || (isFirstLine && group.type === 'dual-ud')"
            :class="`${!isFirstLine ? 'mt-25' : ''} text-center m-0 index_${group.type} font-small`"
            :style="indexCss"
        >
            {{ group.type === 'console' ? '' : port.index }}
        </p>
        <div
            v-if="port.type === 'dual'"
            :class="`${group.type === 'dual-lr' ? 'groupement' : 'groupement-ud'}`"
        >
        </div>
    </article>
</template>

<style scoped>
.font-small {
    font-size: 10px;
    color: rgba(0, 0, 0, 0.65)
}
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
:not(.index_dual-ud).mt-25 {
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
    margin: 0 0.025rem;
}

.article {
    position: relative;
    min-width: 18px;
    height: 30px;
}
.port {
    position: relative;
    content: ' ';
    width: 18px;
    height: 13px;
    border: 1px solid var(--border-color, red);

    box-sizing: border-box;
}
.top {
    content: ' ';
    width: 10px;
    height: 3px;
    position: absolute;
    top: -3px;
    left: 3px;
    border-right: 1px solid rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(0, 0, 0, 0.2);
    border-left: 1px solid rgba(0, 0, 0, 0.2);
    border-color: inherit;
}

.sfp-port {
    position: relative;
    content: ' ';
    width: 18px;
    height: 13px;
    border: 1px solid var(--border-color, red);
    box-sizing: border-box;
}
.sfp-top {
    content: ' ';
    width: 10px;
    height: 2px;
    position: absolute;
    top: -2px;
    left: 4px;
    border-right: 1px solid rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(0, 0, 0, 0.2);
    border-left: 1px solid rgba(0, 0, 0, 0.2);
    border-color: inherit;
}
.groupement {
    position: absolute;
    content: '';
    width: 15px;
    height: 20px;
    top: -7px;
    right: -4px;
    border-top: 1px solid rgb(239 232 0);
    border-right: 1px solid rgb(239 232 0);
    border-left: 1px solid rgb(239 232 0);
    pointer-events: none;
}

.groupement-ud {
    position: absolute;
    content: '';
    width: 15px;
    height: 20px;
    bottom: 0px;
    right: -3px;
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
            portCss() {
                let margins = '';
                 if (this.group.type === 'dual-ud' && this.isFirstLine) {
                     margins = 'margin-top: .15rem';
                 }
                 else if (this.group.type === 'dual-ud' && !this.isFirstLine) {
                     margins = 'margin-top: 0.45rem';
                 }
                return `${margins};--border-color: ${ this.port.color || 'rgba(0,0,0,0.2)'}`
            },
            indexCss() {
                let margins = '';
                 if (this.group.type === 'dual-ud' && this.isFirstLine) {
                     margins = 'margin-top: .15rem';
                 }
                 else if (this.group.type === 'dual-ud' && !this.isFirstLine) {
                     margins = 'margin-top: 0.45rem';
                 }
                const display = `${(this.port.type !== 'dual' && this.group.type === 'dual-lr') || (this.port.type === 'dual' && this.group.type === 'dual-ud') ? 'display: none': ''}`
                return `${margins};${display};`
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
