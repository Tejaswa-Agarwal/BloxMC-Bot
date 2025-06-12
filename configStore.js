const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'data', 'config.json');

let config = {};

function loadConfig() {
    if (fs.existsSync(configFilePath)) {
        const rawData = fs.readFileSync(configFilePath);
        try {
            config = JSON.parse(rawData);
        } catch (e) {
            console.error('Failed to parse config.json:', e);
            config = {};
        }
    } else {
        config = {};
    }
}

function saveConfig() {
    try {
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    } catch (e) {
        console.error('Failed to write config.json:', e);
    }
}

function get(key) {
    return config[key];
}

function set(key, value) {
    config[key] = value;
    saveConfig();
}

loadConfig();

module.exports = {
    get,
    set,
};
