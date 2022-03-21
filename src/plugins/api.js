import axios from 'axios';

export default {
  async get(url, config) {
    return await axios.get(url, config);
  },

  async put(url, data, config) {
    return await axios.put(url, data, config);
  },

  async post(url, data, config) {
    return await axios.post(url, data, config);
  },

  async delete(url, data, config) {
    return await axios.delete(url, data, config);
  },

  async all(queries) {
    return await axios.all(queries);
  },

  spread(callback) {
    return axios.spread(callback);
  },

  async init() {
    axios.defaults.timeout = 20000;

    try {
      const response = await this.get('config.json');

      if (typeof response.data === 'object') {
        if (response.data.API_BASE_URL)
          axios.defaults.baseURL = response.data.API_BASE_URL;
        if (response.data.API_TIMEOUT)
          axios.defaults.timeout = response.data.API_TIMEOUT;
      }
      console.log('API plugin: Successfully initialised');
    } catch (e) {
      console.log('API plugin: Failed to retrieve app config', e);
    }
  },
};
