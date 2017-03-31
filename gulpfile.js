const gulp = require('gulp');
const zip = require('gulp-zip');
const moment = require('moment');
 
gulp.task('default', () =>
    gulp.src(['./**', '!./dist'])
        .pipe(zip(moment().format('Build_YYYY-MM-DD-HH.mm.ss') + '.zip'))
        .pipe(gulp.dest('dist'))
);