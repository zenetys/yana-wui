import axios from 'axios';
import Ev from '@/plugins/evbus';

// Per-API definition object specs.
//
// {
//     /* Given that the object returned by the API plugin is exposed
//      * in Vue at vm.$api, the methods for this API are accessible
//      * in components through this.$api.<id> */
//     id: 'myapi',
//
//     /* Default axios configuration when requesting this API. */
//     config: {
//         baseURL: 'https://myapi.acme.org/v1',
//         timeout: 10000,
//     },
//
//     /* API axios configuration parameters like baseURL or timeout
//      * can be read from global ./config.json. Keys focusing  onthis
//      * API are prefixed by <jsonConfigPrefix>. Read comment on
//      * function cfgJson2Axios() for more information. Options from
//      * ./config.json override potential defaults from the <config>
//      * object. */
//     jsonConfigPrefix: 'MYAPI_',
//
//     /* API methods returning an axios request configuration. Given,
//      * the plugin is exposed in Vue at vm.$api, a <method> for this
//      * API is accessible in components at this.$api.<id>.<method> */
//     methods: {
//         getSomething: (foo, bar) => ({
//             url: '/some/thing?json=1',
//             params: { foo, bar },
//         }),
//     },
// }


const apiBaseDefinition = {
    id: 'base',
    methods: {
        getEntities: () => ({
            url: '/entities',
        }),
        getDatabases: (entity) => ({
            url: '/entity/' + encodeURIComponent(entity) + '/databases',
        }),
        getInventory: (entity, database, search) => ({
            url: '/entity/' + encodeURIComponent(entity) + '/devices?short',
            params: { database, q: search },
        }),
        getFdb: (entity, database, search) => ({
            url: '/entity/' + encodeURIComponent(entity) + '/fdb',
            params: { database, q: search },
        }),
        getInterfaces: (entity, database, deviceId) => ({
            url: '/entity/' + encodeURIComponent(entity) + '/interfaces',
            params: { database, id: deviceId },
        }),
        getDevice: (entity, database, deviceId) => ({
            url: '/entity/' + encodeURIComponent(entity) + '/devices',
            params: { database, id: deviceId },
        }),
        getVlans: (entity, database) => ({
            url: '/entity/' + encodeURIComponent(entity) + '/vlans',
            params: { database },
        }),
        getOui: (search) => ({
            url: '/oui',
            params: { q: search },
        }),
    },
}

const apiBackupDefinition = {
    id: 'backup',
    jsonConfigPrefix: 'BACKUP_',
    methods: {
        getStats: (entity) => ({
            url: '/ls',
            params: { entity, json: 1, verbose: 3 },
        }),
        getLog: (name) => ({
            url: '/log',
            params: { name, json: 1, verbose: 1 },
        }),
        getDiff: (name, commit) => ({
            url: '/diff',
            params: { name, commit, context: 5 },
        }),
        getShow: (name, commit) => ({
            url: '/show',
            params: { name, commit },
        }),
    },
}

/**
 * Axios error interceptor used to emit error messages from a central point,
 * The interceptor is registered in axios via axiosInstance(). That function
 * gets triggered when axios encounters an error.
 *
 * @param {Error} error - Axios error object
 * @returns {Promise<Error>} - Promise rejected with the given error
 */
function axiosErrorInterceptor(error) {
    if (error.config.interceptorErrorMessage !== false) {
        Ev.$emit('error', error, error.config.interceptorErrorMessage ||
            'Something went wrong while communicating with the server');
    }
    return Promise.reject(error);
}

/**
 * Create an axios instance with a custom default configuration.
 * @param {AxiosRequestConfig} axConfig - Default axios requests configuration
 * @returns {Axios} - New axios instance
 */
function axiosInstance(axConfig) {
    const ax = axios.create(axConfig);
    ax.interceptors.response.use((response) => response, axiosErrorInterceptor);
    return ax;
}

/**
 * Translate internal configuration from config.json to an axios request
 * configuration object. For historical reasons, the configuration used to make
 * API calls is fetched from the web server at ./config.json. The data structure
 * in that file does not match axios configuration object, hense this helper
 * to make the translation.
 *
 * @param {object} jsonConfig - Simple KV object parsed from ./config.json
 * @param {string} jsonConfigPrefix - Focus on parameters begining with
 *      the given prefix. The <jsonConfig> may contain settings for multiple
 *      apis. Keys in <jsonConfig> may be prefixed to distinguish those apis,
 *      eg: BACKUP_API_TIMEOUT for the baseURL setting of a "backup" api.
 * @returns {AxiosRequestConfig} - Axios request configuration
 */
function cfgJson2Axios(jsonConfig, jsonConfigPrefix = '') {
    const cfgAxios = {};
    const json2AxiosTranslations = {
        API_BASE_URL: 'baseURL',
        API_TIMEOUT: 'timeout',
    };

    for (let jsonKey in json2AxiosTranslations) {
        const jsonBestKey = jsonConfigPrefix + jsonKey;
        if (jsonConfig[jsonBestKey] !== undefined)
            cfgAxios[json2AxiosTranslations[jsonKey]] = jsonConfig[jsonBestKey];
        else if (jsonConfig[jsonKey] !== undefined)
            cfgAxios[json2AxiosTranslations[jsonKey]] = jsonConfig[jsonKey];
    }
    return cfgAxios;
}

/**
 * Prototype added to each api instances.
 */
const ApiProto = {
    /**
     * Wrapper to axios that returns the response data.
     *
     * @param {string|AxiosRequestConfig} - Request URL as string, or axios
     *      request configuration as object. This is similar to what would be
     *      passed to axios().
     * @param {errorMessage} - Message to emit when the axios interceptor
     *      sees an error, used to indicate the context of th error.
     * @returns {Promise} - Axios promise chained with a then() that returns
     *      the response data.
     */
    axiosData(urlOrConfig, errorMessage) {
        const config = typeof urlOrConfig === 'string' ? { url: urlOrConfig } : urlOrConfig;
        console.log(`api: ${this.id}/axiosData: config =`, config);
        Object.assign(config, { interceptorErrorMessage: errorMessage });
        return this.axios(config).then((response) => response.data);
    },
}

export default {

    /**
     * Register an API
     *
     * @param {object} - API definition object. Specs given in comments
     *      on top of this file.
     */
    registerApi(definition) {
        const api = Object.create(ApiProto);
        api.id = definition.id;
        api.methods = definition.methods;
        for (let m in api.methods) {
            api[m] = function (...args) {
                const argc = api.methods[m].length;
                const axConfig = api.methods[m](...args.slice(0, argc));
                return this.axiosData(axConfig, ...args.slice(argc));
            };
        }
        /* axios instance with specific options for the api */
        const config = Object.assign({}, definition.config,
            cfgJson2Axios(this.jsonConfig, definition.jsonConfigPrefix));
        api.axios = axiosInstance(config);
        this[definition.id] = api;
    },

    /**
     * Initialise the API plugin and set Axios default values
     * This function awaits and is thus declared async.
     * @async
     * @throws On axios error or if the response has unexpected data.
     */
    async init() {
        this.jsonConfig = {};
        axios.defaults.timeout = 20000;

        /* those may throw */
        const response = await axios('config.json');
        if (typeof response.data !== 'object')
            throw Error('Unexpected data type in config.json');
        this.jsonConfig = response.data;
        console.log('api: jsonConfig =', this.jsonConfig);

        /* register our apis */
        this.registerApi(apiBaseDefinition);
        this.registerApi(apiBackupDefinition);

        /* compat */
        this.id = this.base.id;
        this.axios = this.base.axios;
        this.axiosData = ApiProto.axiosData;

        console.log('API plugin: Successfully initialised');
    },
};
