const axios = require('axios');

const req = (config) => (onRes, onErr) => {
  return axios(config)
    .then(onRes)
    .catch(onErr);
};

module.exports = req;
