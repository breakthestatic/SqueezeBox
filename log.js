var LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

function log (level, message) {
    console.log('[' + level + '] ' + message);
}

module.exports = {
    info: function (message) {
        log(LEVELS.INFO, message);
    },
    warn: function (message) {
        log(LEVELS.WARN, message);
    },
    error: function (message) {
        log(LEVELS.ERROR, message);
    }
};