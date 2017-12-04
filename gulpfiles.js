var gulp = require("gulp"),
    sequence = require("gulp-sequence"),//顺序执行
    minImage = require("gulp-imagemin"),//图片压缩
    minImageForPng = require("imagemin-pngquant"),//图片压缩（png）
    minJs = require("gulp-uglify"),//js压缩
    rev = require("gulp-rev"),//MD5版本号
    revCollector = require("gulp-rev-collector"),//版本替换
    cache = require("gulp-cache"),//缓存
    cached = require("gulp-cached"),//增量更改
    less = require('gulp-less'),//编译less
    plumber = require('gulp-plumber'),  //处理管道崩溃问题
    notify = require('gulp-notify'),  //报错与不中断当前任务
    autoprefixer = require('gulp-autoprefixer'),//css自动加前缀
    cleanCss = require('gulp-clean-css'), // css压缩
    rename = require('gulp-rename'),//文件重命名
    zip = require('gulp-zip'),
    del = require("del"),//清除文件
    sourcemaps = require('gulp-sourcemaps');//生成文件映射

var config = {
    source: {
        //MD5版本号文件
        rev: {
            css: "rev/manifest/css/*.json",
            js: "rev/manifest/js/*.json"
        },
        //源文件
        src: {
            less: "src/css/*.less",
            css: ["dist/css/*.min.css", "!dist/css/{bootstrap}.min.css"],//md5
            minJs: "src/js/*.js",
            js: ["dist/js/*.min.js", "!dist/js/{bootstrap,jquery}.min.js"],//md5
            images: "src/images/**/*.{png,jpg,gif,ico}",
            html: "dist/*.html",
            lib: "src/lib/**/*",
            pFile: "rev/file/**/*"
        }
    },
    dir: {
        //MD5版本号文件目录
        rev: {
            css: "rev/manifest/css",
            js: "rev/manifest/js"
        },
        //正式文件目录
        dist: {
            css: "dist/css",
            js: "dist/js",
            images: "dist/images",
            html: "public",
            lib: "dist/lib"
        }
    }
};
//任务
var task = {
    less: "less",
    revCss: "revCss",
    revJs: "revJs",
    revCollectorCss: "revCollectorCss",
    revCollectorHtml: "revCollectorHtml",
    minJs: "minJs",
    minImage: "minImage",
    copy: "copy",
    zip: "zip"
};

//MD5版本号

gulp.task(task.revCss, function () {
    return gulp.src(config.source.src.css)
        .pipe(rev())
        .pipe(gulp.dest("rev/file/css"))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.dir.rev.css));
});
gulp.task(task.revJs, function () {
    return gulp.src(config.source.src.js)
        .pipe(rev())
        .pipe(gulp.dest("rev/file/js"))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.dir.rev.js));
});
gulp.task(task.revCollectorHtml, function () {
    return gulp.src([config.source.rev.css, config.source.rev.js, config.source.src.html])
        .pipe(revCollector())
        .pipe(gulp.dest(config.dir.dist.html));
});
//编译less
gulp.task(task.less, function () {
    return gulp.src(config.source.src.less)  //找到需要编译的less文件
        .pipe(plumber({errorHandler: notify.onError('Error:<%= error.message %>;')}))  //如果less文件中有语法错误，用notify插件报错，用plumber保证任务不会停止
        .pipe(cached('less-task'))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(less())  //如果没错误，就编译less
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: false, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCss())
        .pipe(sourcemaps.write('../map/less'))
        .pipe(gulp.dest(config.dir.dist.css));  //把css文件放到css文件夹下
});
//压缩js
gulp.task(task.minJs, function () {
    return gulp.src(config.source.src.minJs)
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(cached('js-task'))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(minJs())
        .pipe(sourcemaps.write('../map/js'))
        .pipe(gulp.dest(config.dir.dist.js));
});
//压缩图片
gulp.task(task.minImage, function () {
    return gulp.src(config.source.src.images)
        .pipe(cache(minImage({
            progressive: true,
            use: [minImageForPng()]
        })))
        .pipe(gulp.dest(config.dir.dist.images));
});
//清空操作
gulp.task('del:public', function (cb) {
    return del(["public"], cb)
});
gulp.task("public", function () {
    return gulp.src(["dist/**/*", "!dist/css/*", "!dist/js/*", "!dist/*.html", config.source.src.pFile])
        .pipe(gulp.dest('public'))
});
gulp.task(task.zip, ["public"], function () {
    return gulp.src("public/**/*")
        .pipe(zip('public.zip'))
        .pipe(gulp.dest('public'))
});
gulp.task(task.copy, function () {
    return gulp.src(config.source.src.lib)
        .pipe(gulp.dest(config.dir.dist.lib))
})
//正式构建
gulp.task("build",['del:public'], sequence(
    //编译、压缩文件
    [task.less, task.minJs, task.minImage],
    //MD5版本号
    [task.revCss, task.revJs, task.copy],
    //版本替换
    [task.revCollectorHtml], [task.zip]
));
gulp.task("default", ["build"], function () {
    gulp.watch(config.source.src.minJs, [task.minJs]);
    gulp.watch(config.source.src.less, [task.less]);
    console.log('开始监听less及script...');
});