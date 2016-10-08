var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var gulpIf = require('gulp-if');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');

gulp.task('useref', function(){
  return gulp.src('index.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify({preserveComments: 'license'})))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', autoprefixer()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('angular', function(){
  return gulp.src('angular.min.js')
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['useref'], function(){});
