const gulp = require('gulp');
const zip = require('gulp-zip');
const merge = require('merge-stream');
const del = require('del');
const fs = require('fs');
const AWS = require('aws-sdk');

// load config info
AWS.config.loadFromPath('./aws.json');

const updateLambdaCode = () => {
  return new Promise((resolve, reject) => {
    const lambda = new AWS.Lambda({
      Region: 'us-east-1'
    });
    var params = {
      FunctionName: 'createThumbnails',
      S3Key: 'archive.zip',
      S3Bucket: 'erica-charlie-pics-lambda'
    };
    lambda.updateFunctionCode(params, (err, data) => {
      if (err) {
        console.log('error deploying lambda function', err);
      } else {
        console.log('Lambda upload successful');
      }
      resolve();
    });
  });
};

const uploadFileToS3 = filename => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        throw err;
      }
      const s3 = new AWS.S3();
      const params = {
        Bucket: 'erica-charlie-pics-lambda',
        Key: 'archive.zip',
        Body: data,
        ACL: 'public-read',
        ContentType: 'application/zip'
      };
      s3.putObject(params, (perr, pres) => {
        if (perr) {
          console.log('error: ', perr);
        }
        resolve();
      });
    });
  });
};

gulp.task('default', ['upload']);

gulp.task('copy-files', ['clean'], () => {
  var index = gulp.src('src/index.js').pipe(gulp.dest('dist'));

  var dependencies = gulp
    .src('node_modules/**/*')
    .pipe(gulp.dest('dist/node_modules'));

  return merge(index, dependencies);
});

gulp.task('zip', ['copy-files'], () => {
  return gulp.src(['dist/**']).pipe(zip('archive.zip')).pipe(gulp.dest(''));
});

gulp.task('upload', ['zip'], () => {
  return uploadFileToS3('archive.zip').then(updateLambdaCode).then(() => {
    console.log('done!');
  });
});

gulp.task('clean', () => {
  return del('dist');
});
