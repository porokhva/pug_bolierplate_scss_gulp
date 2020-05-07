let uglify = require("gulp-uglify-es").default,
    concat = require("gulp-concat"),
    babel = require("gulp-babel"),
    scriptsPATH = {
        input: "./dev/static/js/",
        ouput: "./build/static/js/",
    }

module.exports = function () {
    $.gulp.task("libsJS:dev", () => {
        return $.gulp
            .src([
                "node_modules/svg4everybody/dist/svg4everybody.min.js",
                "node_modules/moment/min/moment.min.js",
                "node_modules/moment/locale/ru.js",
                "node_modules/swiper/js/swiper.min.js",
                "node_modules/axios/dist/axios.min.js",
            ])
            .pipe(concat("libs.min.js"))
            .pipe($.gulp.dest(scriptsPATH.ouput))
    })

    $.gulp.task("libsJS:build", () => {
        return $.gulp
            .src([
                "node_modules/svg4everybody/dist/svg4everybody.min.js",
                "node_modules/moment/min/moment.min.js",
                "node_modules/moment/locale/ru.js",
                "node_modules/swiper/js/swiper.min.js",
                "node_modules/axios/dist/axios.min.js",
            ])
            .pipe(concat("libs.min.js"))
            .pipe(uglify())
            .pipe($.gulp.dest(scriptsPATH.ouput))
    })

    $.gulp.task("js:dev", () => {
        return $.gulp
            .src([
                scriptsPATH.input + "*.js",
                "!" + scriptsPATH.input + "libs.js",
            ])
            .pipe(babel())
            .pipe($.gulp.dest(scriptsPATH.ouput))
            .pipe(
                $.browserSync.reload({
                    stream: true,
                }),
            )
    })

    $.gulp.task("js:build", () => {
        return $.gulp
            .src([
                scriptsPATH.input + "*.js",
                "!" + scriptsPATH.input + "libs.js",
            ])
            .pipe(
                babel({
                    presets: ["@babel/env"],
                }),
            )
            .pipe($.gulp.dest(scriptsPATH.output))
    })

    $.gulp.task("js:build-min", () => {
        return $.gulp
            .src([
                scriptsPATH.input + "*.js",
                "!" + scriptsPATH.input + "libs.js",
            ])
            .pipe(babel())
            .pipe(uglify())
            .pipe($.gulp.dest(scriptsPATH.ouput))
    })
}
