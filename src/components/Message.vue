<template>
    <div class="messages">
        <div v-for="(entry) in messages" :key="entry.id" class="entry">
            <transition
                :appear="true"
                :css="false"
                @before-enter="onBeforeEnter"
                @enter="(el, done) => { onEnter(el, done, entry) }"
                @leave="(el, done) => { onLeave(el, done, entry) }"
                @after-leave="(el) => { onAfterLeave(el, entry) }"
                @leave-cancelled="(el) => { onAfterLeave(el, entry) }"
            >
                <v-alert
                    @click="deleteMessage(entry)"
                    border="left"
                    elevation="10"
                    colored-border
                    :type="entry.type"
                    v-show="entry.show"
                >
                    <div class="text-subtitle-2">{{ entry.title }}</div>
                    <div class="body-2">{{ entry.text }}</div>
                    <div class="text-caption">{{ entry.detail }}</div>
                </v-alert>
            </transition>
        </div>
    </div>
</template>

<style scoped>
.messages {
    position: fixed;
    top: 1rem;
    bottom: 1rem;
    right: 1rem;
    min-width: 20rem;
    max-width: 30rem;
    display: flex;
    word-break: break-word;
    /*flex-direction: column;
    justify-content: flex-end;*/
    flex-direction: column-reverse;
    justify-content: flex-end;

    /* alerts are always up front but the whole message panel
     * does not prevent :hover on elements below it... */
    z-index: 99;
    visibility: hidden;
}
.entry {
    /* ...cancel visibility: hidden of the parent */
    visibility: visible;
}

/* allow :hover to pass through elements visible between alerts */
.v-alert { margin-bottom: 0; }
.entry + .entry { margin-bottom: 16px; }

.text-caption {
    font-size: 0.68rem !important;
    line-height: 0.9rem !important;
}
</style>

<script>
import axios from 'axios';
import { default as axiosBuildFullPath } from 'axios/lib/core/buildFullPath';
import { default as axiosBuildURL } from 'axios/lib/helpers/buildURL';

function axiosError2URL(e) {
    const method = e.config.method.toUpperCase();
    return (method === 'POST' || method === 'PUT' || method === 'PATCH')
        ? (method + ' ' + axiosBuildFullPath(e.config.baseURL, e.config.url))
        : (method + ' ' + axiosBuildFullPath(e.config.baseURL, axiosBuildURL(e.config.url, e.config.params)));
}

function loopWhile(actionCb, whileCb, delay) {
    setTimeout(() => {
        if (!whileCb())
            return;
        actionCb();
        loopWhile(actionCb, whileCb, delay);
    }, delay);
}

export default {
    name: 'Message',
    props: {
        displayDuration: {
            type: Number,
            required: false,
            default: 10000,
        },
        fadeInStepDuration: {
            type: Number,
            required: false,
            default: 30,
        },
        fadeOutStepDuration: {
            type: Number,
            required: false,
            default: 40,
        },
    },
    data: () => ({
        messages: [],
    }),
    computed: {
    },
    methods: {
        /* v-show fade transitions */
        onBeforeEnter(el) {
            el.style.opacity = 0;
        },
        onEnter(el, done, entry) {
            let opacity = Number(el.style.opacity);
            loopWhile(
                () => { opacity += 0.1; el.style.opacity = opacity; },
                () => { if (opacity < 1 && entry.show) return true; done(); return false; },
                this.fadeInStepDuration
            );
        },
        onLeave(el, done, entry) {
            let opacity = Number(el.style.opacity);
            loopWhile(
                () => { opacity -= 0.1; el.style.opacity = opacity; },
                () => { if (opacity >= 0 && !entry.show) return true; done(); return false; },
                this.fadeOutStepDuration
            );
        },
        onAfterLeave(el, entry) {
            this.deleteMessage(entry, true);
        },

        deleteMessage(entry, flush = false) {
            clearTimeout(entry.timer);
            entry.show = false; /* triggers leave transition */
            if (flush) {
                this.messages.splice(entry.index, 1);
                for (let i = entry.index; i < this.messages.length; i++)
                    this.messages[i].index--;
            }
        },
        onWindowKeyUp(e) {
            if (e.key === 'Escape') {
                for (let i = this.messages.length - 1; i >= 0; i--)
                    this.deleteMessage(this.messages[i]);
            }
        },

        onMessage(entry) {
            if (entry.error) {
                entry.type ||= 'error';
                entry.title ||= 'An error has occurred';
                entry.text = entry.error.toString();
                if (!entry.detail && axios.isAxiosError(entry.error))
                    entry.detail = axiosError2URL(entry.error);
            }
            entry.type ||= 'info';
            const timerCb = () => { this.deleteMessage(entry); };
            entry.id = Date.now() + Math.random();
            entry.show = true;

            if (typeof entry.duration == 'number')
                entry.timer = setTimeout(timerCb, entry.duration);
            else if (entry.duration === undefined)
                entry.timer = setTimeout(timerCb, this.displayDuration);
            else
                entry.timer = null;

            entry.index = this.messages.push(entry) - 1;

            console.log(`Message: [${entry.type.toUpperCase()}] ${entry.title}`,
                (entry.text ? ' | ' + entry.text : ''),
                (entry.detail ? ' | ' + entry.detail : ''));
        },
        onErrorMessage(...args) {
            let error = undefined;
            if (args[0] instanceof Error) {
                error = args[0];
                args.shift();
            }
            this.onMessage({ type: 'error', title: args[0], text: args[1],
                detail: args[2], error });
        },
        onWarningMessage(...args) {
            this.onMessage({ type: 'warning', title: args[0], text: args[1],
                detail: args[2] });
        },
        onInfoMessage(...args) {
            this.onMessage({ type: 'info', title: args[0], text: args[1],
                detail: args[2] });
        },
    },
    mounted() {
        window.addEventListener('keyup', this.onWindowKeyUp);
        this.$ev.$on('message', this.onMessage);
        this.$ev.$on('error', this.onErrorMessage);
        this.$ev.$on('warning', this.onWarningMessage);
        this.$ev.$on('info', this.onInfoMessage);
    },
    destroyed() {
        window.removeEventListener('keyup', this.onWindowKeyUp);
        this.$ev.$off('message', this.onMessage);
        this.$ev.$off('error', this.onErrorMessage);
        this.$ev.$off('warning', this.onWarningMessage);
        this.$ev.$off('info', this.onInfoMessage);
    },
};
</script>
