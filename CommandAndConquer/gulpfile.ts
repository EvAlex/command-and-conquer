/// <reference path="typings/tsd.d.ts" />

import gulp = require('gulp');
import browserify = require('gulp-browserify');
import rename = require('gulp-rename');
import watch = require('gulp-watch');

gulp.task('default', () => {
    gulp.start('watch');
});

gulp.task('build', () => {
    return gulp.src('./Web/js/cnc.js')
        .pipe(browserify({}))
        .pipe(rename('app.js'))
        .pipe(gulp.dest('./Web'));
});

gulp.task('watch', ['build'], () => {
    return gulp.watch(getClientJsGLob(), () => {
        return gulp.start('build');
    });
});

function getClientJsGLob() {
    return ['./Web/**/*.js', '!./Web/releases/**/*.js'];
}