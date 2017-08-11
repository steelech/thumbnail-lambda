const gulp = require('gulp');
const zip = require('gulp-zip');
const merge = require('merge-stream');
const del = require('del');

gulp.task('default', ['zip']);

gulp.task('copy-files', ['clean'], () => {
  var index = gulp.src('src/index.js')
    .pipe(gulp.dest('dist'));

  var dependencies = gulp.src('node_modules/**/*')
    .pipe(gulp.dest('dist/node_modules'));

  return merge(index, dependencies);
});

gulp.task('zip', ['copy-files'], () => {
    gulp.src(['dist/**'])
      .pipe(zip('archive.zip'))
      .pipe(gulp.dest(''));
});

gulp.task('clean', () => {
  return del('dist');
})
