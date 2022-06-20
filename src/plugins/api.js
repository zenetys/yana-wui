import axios from 'axios';
import Ev from '@/plugins/evbus';

/**
 * Handle errors from the API and display them to the user.
 * @deprecated Will be removed along with get() from the exported object
 *
 * @param {object} error - The error object from the API
 * @param {string} errorContext - The context to be displayed in the error message
 */
function handleError(error, errorContext) {
    const defaultErrorMessage = 'Something went wrong while communicating with the server.';
    Ev.$emit('error', error, errorContext || defaultErrorMessage);
}

export default {
    /**
     * Make a GET request to the API
     * @deprecated Use axiosData instead
     *
     * @param {string} url - the URL to call
     * @param {string} errorContext - The context to be displayed in case of error
     * @param {AxiosRequestConfig} config - The config to be passed to axios
     * @returns {*} - The response from the API
     */
    async get(url, errorContext, config) {
        return await axios
            .get(url, config)
            .then((response) => response.data)
            .catch((error) => handleError(error, errorContext));
    },

    axiosData(urlOrConfig, errorMessage) {
        const config = typeof urlOrConfig === 'string' ? { url: urlOrConfig } : urlOrConfig;
        console.log('api: axiosData: config =', config);
        Object.assign(config, { interceptorErrorMessage: errorMessage });
        return axios(config).then((response) => response.data);
    },

    /**
     * Initialise the API plugin and set Axios default values
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

        try {
            const response = await this.get('config.json');

            if (typeof response === 'object') {
                if (response.API_BASE_URL) axios.defaults.baseURL = response.API_BASE_URL;
                if (response.API_TIMEOUT) axios.defaults.timeout = response.API_TIMEOUT;
            }
            console.log('API plugin: Successfully initialised');
        } catch (e) {
            console.log('API plugin: Failed to retrieve app config', e);
        }
    },
};
