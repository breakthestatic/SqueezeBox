const gulp = require('gulp');
const zip = require('gulp-zip');
const moment = require('moment');
 
gulp.task('default', () =>
    gulp.src(['./**', '!./dist'])
        .pipe(zip('Build_' + moment().format('YYYY-MM-DD-HH.mm.ss') + '.zip'))
        .pipe(gulp.dest('dist'))
);