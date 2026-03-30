/**
 * Logger - Consistent logging utility
 */

const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.info;

function log(level, message, data = null) {
    if (LOG_LEVELS[level] < currentLevel) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
        console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
    } else {
        console.log(`${prefix} ${message}`);
    }
}

function debug(message, data = null) {
    log('debug', message, data);
}

function info(message, data = null) {
    log('info', message, data);
}

function warn(message, data = null) {
    log('warn', message, data);
}

function error(message, data = null) {
    log('error', message, data);
}

function success(message) {
    console.log(`✓ ${message}`);
}

function fail(message) {
    console.log(`✗ ${message}`);
}

function skip(message) {
    console.log(`⊘ ${message}`);
}

function section(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`  ${title}`);
    console.log('='.repeat(60) + '\n');
}

module.exports = {
    debug,
    info,
    warn,
    error,
    success,
    fail,
    skip,
    section,
    LOG_LEVELS,
};
