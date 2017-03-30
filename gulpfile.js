const gulp = require('gulp');
const zip = require('gulp-zip');
 
gulp.task('default', () =>
    gulp.src(['./**', '!./dist'])
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('dist'))
);