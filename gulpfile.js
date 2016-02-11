'use strict';

var gulp = require('gulp');
var notify = require("gulp-notify");
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var ejs = require('gulp-ejs');
var browserSync = require('browser-sync').create();

let handleErrors = function() {
	let args = Array.prototype.slice.call(arguments);
	let err = {
		title: "Compile Error",
		message: "<%= error %>"
	};
	notify.onError(err).apply(this, args);
	this.emit('end');
};

gulp.task('browser-sync', function() {
	var ops = {baseDir: './', index: 'index.html'};
    browserSync.init({server: ops});
});
gulp.task('bs-reload', function() { browserSync.reload(); });
gulp.task("ejs", function() {
    gulp.src(['html/**/*.html', '!' + 'html/_*.html'])
	.pipe(ejs())
	.pipe(gulp.dest('./'));
});
 
gulp.task('default', ['browser-sync', 'ejs'], function () {
    gulp.watch('html/**/*.html', ['ejs', 'bs-reload']);
    gulp.watch('html/**/*.ejs', ['ejs', 'bs-reload']);
});

gulp.task('browserify', () => {
	return browserify('./js/index.js', {debug: true})
		.transform(babelify)
		.bundle()
		.on('error', handleErrors)
		.on('error', function(err) {
	        console.log(err.message); 
	        console.log(err.stack);
	    })
		.pipe(source('bundle.js'))
		.pipe(notify('DONE browserify!!'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('css', () => {
    return gulp.src('./sass/main.scss')
    	.pipe(sass())
        .pipe(postcss([require('autoprefixer'), require('cssnano')]))
        .pipe(plumber())
		.pipe(notify('DONE CSS!!'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', ['browserify', 'css'], function() {
	gulp.watch('./js/**/*.js', ['browserify']);
	gulp.watch('./js/*.js', ['browserify']);
	
	gulp.watch('./sass/**/*.scss', ['css']);
	gulp.watch('./sass/*.scss', ['css']);
});