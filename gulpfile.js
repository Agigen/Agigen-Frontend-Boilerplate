'use strict';

var sources = {
    browserify: {
        watch: [
            'static-src/js/**/*.js'
        ],
        files: [
            './static-src/js/main.js'
        ]
    },
    scss: {
        watch: [
            'static-src/scss/**/*',
        ],
        files: [
            'static-src/scss/**/*',
        ]
    },
};

var destinations = {
    scripts: 'static/js/',
    styles: 'static/css/'
};

var lint = [
    'gulpfile.js',
    'static-src/js/**/*.js',
];


var gulp = require('gulp');
var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var notify = require("gulp-notify");
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var del = require('del');
var yargs = require('yargs');
var inline_base64 = require('gulp-inline-base64');
var sourcemaps = require('gulp-sourcemaps');
//var merge = require('merge-stream');

var production = (yargs.argv.environment === 'production');
var verbose = yargs.argv.verbose;

var handleError = notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
});

// Handler for browserify
var browserifyHandleError = function(err){
    handleError(err);
    this.end();
};

// Cleanup tasks
gulp.task('clean', ['clean_scripts', 'clean_styles'], function(cb) {
    cb();
});

gulp.task('clean_scripts', function(cb) {
    del(['static/js/**/*'], cb);
});

gulp.task('clean_styles', function(cb) {
    del(['static/css/**/*'], cb);
});

// Copys all the user created scripts
gulp.task('scripts', ['clean_scripts'], function() {
    return browserify({
        entries: sources.browserify.files,
        insertGlobals : true,
        debug : !production,
    })
        .bundle()
        .on('error', browserifyHandleError)
        .pipe(source('main.js'))
        .on('error', handleError)
        .pipe(gulpif(production, streamify(uglify())))
        .on('error', handleError)
        .pipe(gulp.dest(destinations.scripts));
});

// Generate css files from scss
gulp.task('styles', ['clean_styles'], function(){
    return gulp.src(sources.scss.files)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: production ? 'compressed' : 'nested',
        }))
        .on('error', handleError)
        .pipe(sourcemaps.write('./maps'))
        .on('error', handleError)
        .pipe(inline_base64({
            baseDir: destinations.styles,
            maxSize: 14 * 1024,
            debug: verbose,
        }))
        .on('error', handleError)
        .pipe(gulp.dest(destinations.styles));
});

gulp.task('lint', function() {
    return gulp.src(lint)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter(stylish));
});


// Watch the folders
gulp.task('watch', function() {
    gulp.watch(sources.browserify.watch, ['lint', 'scripts']);
    gulp.watch(sources.scss.watch, ['styles']);
});


// build task
gulp.task('build', ['lint', 'scripts', 'styles']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build', 'watch']);
