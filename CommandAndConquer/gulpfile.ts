/// <reference path="typings/tsd.d.ts" />

import gulp = require('gulp');
import browserify = require('gulp-browserify');
import rename = require('gulp-rename');

gulp.task('default', () => {
    return gulp.src(['./Web/**/*.js', '!./Web/releases/**/*.js'])
        .pipe(browserify({}))
        .pipe(rename('app.js'))
        .pipe(gulp.dest('./Web'));
});