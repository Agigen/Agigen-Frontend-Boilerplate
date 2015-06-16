'use strict';

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
var autoprefixer = require('autoprefixer-core');
var postcss = require('gulp-postcss');
//var merge = require('merge-stream');

var sources = {
    browserify: {
        watch: [
            'static-source/public/js/**/*.js',
            'static-source/admin/js/**/*.js'
        ],
        files: [
            './static-source/public/js/main.js'
        ],
        adminFiles: [
            './static-source/admin/js/main.js'
        ]
    },
    scss: {
        watch: [
            'static-source/public/scss/**/*',
            'static-source/admin/scss/**/*',
        ],
        files: [
            'static-source/public/scss/**/*.scss',
        ],
        adminFiles: [
            'static-source/admin/scss/**/*.scss',
        ]
    },
};

var destinations = {
    scripts: 'static/js/',
    styles: 'static/css/',
    adminScripts: 'static/admin/js/',
    adminStyles: 'static/admin/css/'
};

var lint = [
    'gulpfile.js',
    'static-source/public/js/**/*.js',
    'static-source/admin/js/**/*.js',
];

var production = (yargs.argv.environment === 'production');
var verbose = yargs.argv.verbose;

var handleError = notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
});

var postcssProcessors = [
    autoprefixer({
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'IE 9'],
    })
];

// Handler for browserify
var browserifyHandleError = function(err){
    handleError(err);
    this.end();
};

// Cleanup tasks
gulp.task('clean', ['clean_scripts', 'clean_styles', 'clean_admin_styles', 'clean_admin_scripts'], function(cb) {
    cb();
});

gulp.task('clean_scripts', function(cb) {
    del(['static/js/**/*'], cb);
});
gulp.task('clean_admin_scripts', function(cb) {
    del(['static/admin/js/**/*'], cb);
});
gulp.task('clean_styles', function(cb) {
    del(['static/css/**/*'], cb);
});
gulp.task('clean_admin_styles', function(cb) {
    del(['static/admin/css/**/*'], cb);
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
gulp.task('admin-scripts', ['clean_admin_scripts'], function() {
    return browserify({
        entries: sources.browserify.adminFiles,
        insertGlobals : true,
        debug : !production,
    })
        .bundle()
        .on('error', browserifyHandleError)
        .pipe(source('main.js'))
        .on('error', handleError)
        .pipe(gulpif(production, streamify(uglify())))
        .on('error', handleError)
        .pipe(gulp.dest(destinations.adminScripts));
});

// Generate css files from scss
gulp.task('styles', ['clean_styles'], function(){
    return gulp.src(sources.scss.files)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: production ? 'compressed' : 'nested',
        }))
        .on('error', handleError)
        .pipe(inline_base64({
            baseDir: destinations.styles,
            maxSize: 14 * 1024,
            debug: verbose,
        }))
        .on('error', handleError)
        .pipe(postcss(postcssProcessors))
        .on('error', handleError)
        .pipe(sourcemaps.write('./maps'))
        .on('error', handleError)
        .pipe(gulp.dest(destinations.styles));
});

gulp.task('admin-styles', ['clean_admin_styles'], function(){
    return gulp.src(sources.scss.adminFiles)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: production ? 'compressed' : 'nested',
        }))
        .on('error', handleError)
        .pipe(inline_base64({
            baseDir: destinations.adminStyles,
            maxSize: 14 * 1024,
            debug: verbose,
        }))
        .on('error', handleError)
        .pipe(postcss(postcssProcessors))
        .on('error', handleError)
        .pipe(sourcemaps.write('./maps'))
        .on('error', handleError)
        .pipe(gulp.dest(destinations.adminStyles));
});

gulp.task('lint', function() {
    return gulp.src(lint)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter(stylish));
});


// Watch the folders
gulp.task('watch', function() {
    gulp.watch(sources.browserify.watch, ['lint', 'scripts', 'admin-scripts']);
    gulp.watch(sources.scss.watch, ['styles', 'admin-styles']);
});


// build task
gulp.task('build', ['lint', 'scripts', 'styles', 'admin-scripts', 'admin-styles']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build', 'watch']);
