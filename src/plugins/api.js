import axios from 'axios';
import Ev from '@/plugins/evbus';

export default {

    axiosData(urlOrConfig, errorMessage) {
        const config = typeof urlOrConfig === 'string' ? { url: urlOrConfig } : urlOrConfig;
        console.log('api: axiosData: config =', config);
        Object.assign(config, { interceptorErrorMessage: errorMessage });
        return axios(config).then((response) => response.data);
    },

    /**
     * Initialise the API plugin and set Axios default values
     * This function awaits and is thus declared async.
     * @async
     * @throws On axios error or if the response has unexpected data.
     */
    async init() {
        axios.defaults.timeout = 20000;
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.config.interceptorErrorMessage !== false) {
                    Ev.$emit('error', error, error.config.interceptorErrorMessage ||
                        'Something went wrong while communicating with the server');
                }
                return Promise.reject(error);
            }
        );

        /* those may throw */
        this.apiConfig = await this.axiosData('config.json', false);
        if (typeof this.apiConfig !== 'object')
            throw Error('Unexpected data type in config.json');

        /* update axios defaults */
        if (this.apiConfig.API_BASE_URL)
            axios.defaults.baseURL = this.apiConfig.API_BASE_URL;
        if (this.apiConfig.API_TIMEOUT)
            axios.defaults.timeout = this.apiConfig.API_TIMEOUT;

        console.log('API plugin: Successfully initialised');
    },
};
