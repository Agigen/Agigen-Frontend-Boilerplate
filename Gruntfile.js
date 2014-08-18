var path = require('path');

module.exports = function(grunt) {
    'use strict';

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Project configuration
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),

        // Config data
        config: grunt.file.readJSON(path.join(__dirname, '/frontend-config.json')),

        jshint: {
            options: {
                jshintrc: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
        },

        copy: {
            /**
             * We'll copy our Javascript libs from bower to our static/js folder
             */
            bower: {
                expand: true,
                flatten: true,
                cwd: '<%= config.dev.paths.bower %>',

                src: '<%= config.bowerLibs %>',
                dest: '<%= config.dev.paths.static %>/js/libs'
            },

            dev: {
                expand: true,
                cwd: '<%= config.dev.paths.root %>/js',

                src: '**/*.js',
                dest: '<%= config.dev.paths.static %>/js'
            }
        },

        // Empties folders to start fresh
        clean: {
            css: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.dist.paths.static %>/css/*'
                    ]
                }]
            }
        },

        sass: {
            dev: {
                options: {
                    sourcemap: true
                },

                files: [{
                    expand: true,
                    cwd: '<%= config.dev.paths.root %>',

                    src: [ 'scss/main.scss' ],
                    dest: '<%= config.dev.paths.static %>/css',
                    ext: '.css',

                    flatten: true
                }]
            },

            dist: {
                options: {
                    sourcemap: false,
                    style: 'compressed'
                },

                files: [{
                    expand: true,
                    cwd: '<%= config.dist.paths.root %>',

                    src: [ 'scss/main.scss' ],
                    dest: '<%= config.dist.paths.static %>/css',
                    ext: '.css',

                    flatten: true
                }]
            },
        },

        watch: {
            dev: {
                files: [ '<%= config.dev.paths.root %>/scss/**', '<%= config.dev.paths.root %>/js/**' ],
                tasks: [ 'dev-build' ]
            },
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: [ 'jshint:gruntfile' ]
            }
        },
    });

    grunt.registerTask('build-development', [ 'sass:dev', 'copy:bower', 'copy:dev' ]);

    grunt.registerTask('default', [ 'jshint', 'clean', 'build-development', 'watch' ]);
};
