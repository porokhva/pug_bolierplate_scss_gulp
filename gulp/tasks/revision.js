var rev = require('gulp-rev')
var revReplace = require('gulp-rev-replace')
module.exports = function () {
    $.gulp.task('revision', () => {
        return $.gulp
            .src(['./build/static/**/*.css', './build/static/**/*.js'])
            .pipe(rev())
            .pipe($.gulp.dest('./build/static'))
            .pipe(rev.manifest())
            .pipe($.gulp.dest('./build/static'))
    })
    $.gulp.task('revisionReplace', () => {

        var manifest = $.gulp.src('./build/static/rev-manifest.json')
        return $.gulp
            .src('./build/*.html')
            .pipe(revReplace({ manifest: manifest }))
            .pipe($.gulp.dest('./build'))
    })
};