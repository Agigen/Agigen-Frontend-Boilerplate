'use strict';

var sources = {
    browserify: {
        watch: [
            'frontend/js/**/*.js'
        ],
        files: [
            'frontend/js/main.js'
        ]
    },
    scss: {
        watch: [
            'frontend/scss/**/*',
        ],
        files: [
            'frontend/scss/**/*',
        ]
    },
};

var destinations = {
    scripts: 'static/js/',
    styles: 'static/css/'
};

var lint = [
    'gulpfile.js',
    'frontend/js/**/*.js',
];


var gulp = require('gulp');
var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sass = require('gulp-ruby-sass');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var del = require('del');
var yargs = require('yargs');
var inline_base64 = require('gulp-inline-base64');

var production = (yargs.argv.environment === 'production');

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
    return gulp.src(sources.browserify.files)
        .pipe(browserify({
            insertGlobals : true,
            debug : !production,
            paths: ['./node_modules','./frontend/js/'],
        }))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulpif(production, uglify()))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest(destinations.scripts));
});

// Generate css files from scss
gulp.task('styles', ['clean_styles'], function(){
    return gulp.src(sources.scss.files)
        //.pipe(flatten())
        .pipe(sass({
            style: production ? 'compressed' : 'expanded',
        }))
        .on('error', function (err) { console.log(err.message); })
        .pipe(inline_base64({
            baseDir: destinations.styles,
            maxSize: 14 * 1024,
        }))
        .on('error', function (err) { console.log(err.message); })
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
