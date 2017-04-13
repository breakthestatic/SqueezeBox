const gulp = require('gulp');
const lambda = require('gulp-awslambda');
const s3 = require('gulp-s3-upload')();
const zip = require('gulp-zip');
const moment = require('moment');
const config = require('./build-config');

var buildName = 'Build_' + moment().format('YYYY-MM-DD-HH.mm.ss') + '.zip';
 
gulp.task('default', () =>
    gulp.src(['./**', '!./dist/**'])
        .pipe(zip(buildName))
        .pipe(s3({ Bucket: config.BUCKET}))
        .pipe(lambda({
            FunctionName: config.FUNCTION_NAME,
            Code: {
                S3Bucket: config.BUCKET,
                S3Key: buildName,
            }
        }))
);