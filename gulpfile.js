const gulp = require('gulp');
const zip = require('gulp-zip');
const merge = require('merge-stream');

gulp.task('default', ['zip']);

gulp.task('copy-files', () => {
  var index = gulp.src('src/index.js')
    .pipe(gulp.dest('dist'));

  var dependencies = gulp.src('node_modules/**/*')
    .pipe(gulp.dest('dist/node_modules'));

  return merge(index, dependencies);
});

gulp.task('zip', ['copy-files'], () => {
    gulp.src(['dist/**'])
      .pipe(zip('newZip.zip'))
      .pipe(gulp.dest(''));
});
