<template>
    <main class="switch group end">
        <span v-if="isDefault === true" class="mdi mdi-vlc is-def-warning" :title="`Attention: La configuration du switch est inconnue,\n ceci est une configuration par default`"></span>
        <Group v-for="(group, i) in groups" :key="i" class="group flex-col margins" :group="group"/>
    </main>
</template>

<style >
.is-def-warning {
    position: absolute;
    top: 10px;
    left: 10px;
}
.end {
    justify-content: flex-end;
}
.group {
    display: flex;
    flex-wrap: wrap;
}
.flex-col {
    flex-direction: column;
}
.center {
    justify-content: space-around;
}
.space {
    margin-top: 0.25rem;
}

.switch {
    width: 53rem;
    max-width: 90vw;
    max-height: 9rem;

    border: 1px solid rgba(0,0,0, 0.15);
    background-color: rgba(0,0,0, 0.025);
    padding: 0 0.25rem;
    box-sizing: content-box;

    position: relative;
}
.section {
    min-width: 30px;
    height: 100px;
}
.margins {
    padding: 0.15rem 0.15rem;
}
.switch > .section:nth-child(odd) {
    margin: 0 1rem;
}

p {
    font-size: 13px;
}
</style>

<script>
import Group from './Group.vue';

export default {
    name: 'ZSwitch',
    components: {
        Group
    },
    props: {
        groups: {
            type: Array,
        },
        isDefault: {
            type: Boolean,
        },
    },
};
</script>
