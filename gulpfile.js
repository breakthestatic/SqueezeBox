const gulp = require('gulp');
const lambda = require('gulp-awslambda');
const zip = require('gulp-zip');
const moment = require('moment');
const opts = {
	region: 'us-east-1'
};
 
gulp.task('default', () =>
    gulp.src(['./**', '!./dist/**'])
        .pipe(zip('Build_' + moment().format('YYYY-MM-DD-HH.mm.ss') + '.zip'))
        .pipe(lambda('squeezeBox', opts))
        .pipe(gulp.dest('./dist'))
        
);