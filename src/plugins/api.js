import axios from 'axios';
import Store from '@/plugins/store';
/**
 * Handle errors from the API and display them to the user.
 * @param {object} error - The error object from the API
 * @param {string} errorContext - The context to be displayed in the error message
 */
function handleError(error, errorContext) {
    const defaultErrorMessage = 'Something went wrong while communicating with the server.';
    const message = {
        type: 'error',
        content: 'Error : ' + errorContext || defaultErrorMessage,
        error: error,
    };
    Store.setInfoMessage(message);
}

export default {
    /**
     * Make a GET request to the API
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
    /**
     * Make a PUT request to the API
     * @param {string} url - the URL to call
     * @param {object} data - The data to send to the API
     * @param {string} errorContext - The context to be displayed in case of error
     * @param {AxiosRequestConfig} config - The config to be passed to axios
     * @returns {*} - The response from the API
     */
    async put(url, data, errorContext, config) {
        return await axios
            .put(url, data, config)
            .then((response) => response.data)
            .catch((error) => handleError(error, errorContext));
    },
    /**
     * Make a POST request to the API
     * @param {string} url - the URL to call
     * @param {object} data - The data to send to the API
     * @param {string} errorContext - The context to be displayed in case of error
     * @param {AxiosRequestConfig} config - The config to be passed to axios
     * @returns {*} - The response from the API
     */
    async post(url, data, errorContext, config) {
        return await axios
            .post(url, data, config)
            .then((response) => response.data)
            .catch((error) => handleError(error, errorContext));
    },
    /**
     * Make a DELETE request to the API
     * @param {string} url - the URL to call
     * @param {object} data - The data to send to the API to delete the right resource
     * @param {string} errorContext - The context to be displayed in case of error
     * @param {AxiosRequestConfig} config - The config to be passed to axios
     * @returns {*} - The response from the API
     */
    async delete(url, data, errorContext, config) {
        return await axios
            .delete(url, data, config)
            .then((response) => response.data)
            .catch((error) => handleError(error, errorContext));
    },
    /**
     * Execute multiple Axios queries in parallel
     * @param {*} queries - The queries to execute
     * @returns {*} - The responses from the API
     */
    async all(queries) {
        return await axios.all(queries);
    },
    /**
     * Spread multiple Axios responses from a callback
     * @param {*} callback - The callback to execute
     * @returns - An array of responses from the API
     */
    spread(callback) {
        return axios.spread(callback);
    },
    /**
     * Initialise the API plugin and set Axios default values
     */
    async init() {
        axios.defaults.timeout = 20000;

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
