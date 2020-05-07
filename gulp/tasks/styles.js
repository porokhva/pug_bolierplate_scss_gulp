let plumber = require('gulp-plumber'),
    scss = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    csscomb = require('gulp-csscomb'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    grid = require('smart-grid'),
    gcmq = require('gulp-group-css-media-queries'),
    stylesPATH = {
        "input": "./dev/static/styles/",
        "ouput": "./build/static/css/"
    };

module.exports = function () {
    $.gulp.task('styles:dev', () => {
        return $.gulp.src(stylesPATH.input + 'styles.scss')
            .pipe(plumber())
            // .pipe(sourcemaps.init())
            .pipe(scss())
            .pipe(gcmq())
            // .pipe(sourcemaps.write())
            .pipe(rename('styles.min.css'))
            // .pipe(rename('styles.css'))
            .pipe($.gulp.dest(stylesPATH.ouput))
            .on('end', $.browserSync.reload);
    });
    $.gulp.task('styles:build', () => {
        var plugins = [
            autoprefixer(),
            cssnano()
        ];
        return $.gulp.src(stylesPATH.input + 'styles.scss')
            .pipe(scss())
            .pipe(csscomb())
            .pipe(gcmq())
            .pipe(postcss(plugins))
            .pipe($.gulp.dest(stylesPATH.ouput))
    });
    $.gulp.task('styles:build-min', () => {
        var plugins = [
            autoprefixer(),
            cssnano()
        ];
        return $.gulp.src(stylesPATH.input + 'styles.scss')
            .pipe(scss())
            // .pipe(csso())
            .pipe(csscomb())
            .pipe(gcmq())
            .pipe(postcss(plugins))
            .pipe(rename('styles.min.css'))
            .pipe($.gulp.dest(stylesPATH.ouput))
            
    });


    /* It's principal settings in smart grid project */
    var settings = {
        outputStyle: 'scss', /* less || scss || sass || styl */
        columns: 12, /* number of grid columns */
        offset: '10px', /* gutter width px || % || rem */
        mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
        container: {
            maxWidth: '1900px', /* max-width оn very large screen */
            fields: '30px' /* side fields */
        },
        breakPoints: {
            xl: {
                width: '1600px', /* -> @media (max-width: 1100px) */
            },
            lg: {
                width: '1400px', /* -> @media (max-width: 1100px) */
            },
            md: {
                width: '1200px'
            },
            sm: {
                width: '768px',
                fields: '15px' /* set fields only if you want to change container.fields */
            },
            xs: {
                width: '560px'
            }
            /* 
            We can create any quantity of break points.

            some_name: {
                width: 'Npx',
                fields: 'N(px|%|rem)',
                offset: 'N(px|%|rem)'
            }
            */
        }
        };
    //Smartgrid output path
    grid('./dev/static/styles/utils', settings);
};
