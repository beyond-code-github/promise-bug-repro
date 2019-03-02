module.exports = function(config) {
    config.set({
        frameworks: ['browserify', 'tap'],
        preprocessors: {
            'test.js': [ 'browserify' ]
        },
        files: ['test.js']
    });
};