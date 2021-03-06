var gulp = require('gulp');
var chalk = require('chalk');
var notifier = require('node-notifier');
var stylus = require('gulp-stylus');
var jeet = require('jeet');
var rupture = require('rupture');
var cmq = require('gulp-merge-media-queries');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var del = require('del');

// The source and destination directories
// Note: If you are using your own theme, simply replace the 'default' theme with your own theme dir (This will also need to be done in server.js)

var theme = 'default';

var io = {
    in: __dirname+'/'+'src/core',
    out: __dirname+'/'+'trimurti/core'
  }

var themePaths = {
    in: __dirname+'/'+'src/themes/'+theme,
    out: __dirname+'/'+'trimurti/themes/'+theme
  }


// The paths
var path = {
  views: '/views',
  scripts: '/scripts',
  styles: '/styles'
}

// Handle errors
var errors = 0;
var onError = function (err) {
  console.log(chalk.red('✘ Build failed!'))
  notifier.notify({ title: 'Build', message: 'Failed'});
  console.log(err);
  errors = errors+1
  this.emit('end');
};

/* Watchers */
gulp.task('watch', function() {
  gulp.watch(io.in+path.scripts+'/**/*.js', ['scripts']);
  gulp.watch(io.in+path.styles+'/**/*.styl', ['styles']);
  gulp.watch(themePaths.in+path.styles+'/**/*.styl', ['theme']);
  gulp.watch(themePaths.in+path.views+'/**/*.ejs', ['theme']);
})

// Process styles
gulp.task('styles', function() {
  gulp.src(io.in+path.styles+'/start.styl')
  .pipe(plumber(
    { errorHandler: onError }
  ))
  .pipe(stylus({
    'include css': true,
    use: [jeet(), rupture()]
  }))
  .pipe(concat('core.min.css'))
  .pipe(cmq())
  .pipe(gulp.dest(io.out+path.styles))
});

// Process theme
gulp.task('theme', function() {
  gulp.src(themePaths.in+path.styles+'/start.styl')
  .pipe(plumber(
    { errorHandler: onError }
  ))
  .pipe(stylus({
    'include css': true,
    use: [jeet(), rupture()]
  }))
  .pipe(concat('core.min.css'))
  .pipe(cmq())
  .pipe(gulp.dest(themePaths.out+path.styles))
  gulp.src(themePaths.in+path.views+'/**/*.ejs')
  .pipe(plumber(
    { errorHandler: onError }
  ))
  .pipe(gulp.dest(themePaths.out+path.views))
});

// Copy the scripts files to the trimurti scripts dir
gulp.task('scripts', function() {
  gulp.src(io.in+path.scripts+'/**/*.js')
  .pipe(gulp.dest(io.out+path.scripts))
});

// Update the main trimurti.js file
gulp.task('updateApp', function() {
  gulp.src(io.in+'/start/trimurti.js')
  .pipe(gulp.dest('./'))
});

// run all the required build tasks
gulp.task('build', function() {
  gulp.start('styles', 'scripts', 'updateApp');
});

// Delete the destination directory
gulp.task('clean', function() {
  return del(io.out);
});
