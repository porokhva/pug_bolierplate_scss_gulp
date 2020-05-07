let imagemin = require("gulp-imagemin"),
    recompress = require("imagemin-jpeg-recompress"),
    pngquant = require("imagemin-pngquant"),
    cache = require("gulp-cache"),
    imgPATH = {
        input: [
            "./dev/static/images/**/*.{png,jpg,gif,svg}",
            "!./dev/static/images/svg/*",
        ],
        ouput: "./build/static/images/",
    }

module.exports = function() {
    $.gulp.task("img:dev", () => {
        return $.gulp.src(imgPATH.input).pipe($.gulp.dest(imgPATH.ouput))
    })
    $.gulp.task("img:build", () => {
        return $.gulp
            .src(imgPATH.input)
            .pipe(
                imagemin(
                    [
                        pngquant(),
                        recompress({
                            loops: 4,
                            min: 70,
                            max: 80,
                            quality: "high",
                        }),
                    ],

                    {
                        verbose: true,
                    },
                ),
            )
            .pipe($.gulp.dest(imgPATH.ouput))
    })
}
// gulp.task('img:build', () => {
//     return $.gulp.src(imgPATH.input)
//         .pipe(imagemin([
//             pngquant(),
//             recompress({
//               loops: 4,
//               min: 70,
//               max: 80,
//               quality: 'high'
//             }),
//             imagemin.gifsicle(),
//             imagemin.optipng(),
//             imagemin.svgo()
//           ]))
//         .pipe(gulp.dest(path.build.img))
//         .pipe(reload({stream: true}));
// });
