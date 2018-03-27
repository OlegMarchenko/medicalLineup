'use strict';

var gulp            = require('gulp'),
    watch           = require('gulp-watch'),
    uglify          = require('gulp-uglify'),
    sass            = require('gulp-sass'),
    cssmin          = require('gulp-minify-css'),
    imagemin        = require('gulp-imagemin'),
    pngquant        = require('imagemin-pngquant'),
    del             = require('del'),
    cached          = require('gulp-cached'),
    clean           = require('gulp-clean'),
    concat          = require('gulp-concat'),
    util            = require('gulp-util'),
    count           = require('gulp-count'),
    rimraf          = require('rimraf'),
    plumber         = require('gulp-plumber'),
    handlebars      = require('handlebars'),
    postcss         = require('gulp-postcss'),
    autoprefixer    = require('autoprefixer'),
    sourcemaps      = require('gulp-sourcemaps'),
    rigger          = require('gulp-rigger'),
    browserSync     = require('browser-sync'),
    reload          = browserSync.reload;


var path = {
        build: {  // Пути к готовым после сборки файлам
             html:  'build/',
             js:    'build/js/',
             css:   'build/css/',
             img:   'build/img/',
             fonts: 'build/fonts/'
      },
        src: { // Пути откуда берем исходные файлы
            html:   'src/*.html',
            js:     'src/js/main.js',
            style:  'src/style/main.scss',
            img:    'src/img/**/*.*',
            fonts:  'src/fonts/**/*.*'
        },
        watch: { //Пути к файлам, за которыми мы хотим наблюдать
            html:   'src/**/*.html',
            js:     'src/js/**/*.js',
            style:  'src/style/**/*.scss',
            img:    'src/img/**/*.*',
            fonts:  'src/fonts/**/*.*'
        },
            clean: './build'
};

// Созаем переменную с найстрйками dev - сервера

var config = {
    server: {
        baseDir: "./build"
    },
    // tunnel:      true,
    host:        'localhost',
    port:        8000,
    logPrefix:   "Oleg"
};

// Таск для сборки HTML

gulp.task('html:build', function () {
   gulp.src(path.src.html)         // Выберим файлы по нужному пути
       .pipe(plumber(function (error) {
           util.log(util.colors.bold.red(error.message));
           util.beep();
           this.emit('end');
       }))
       .pipe(rigger())
       .pipe(plumber.stop())
       .pipe(gulp.dest(path.build.html))
       .pipe(count('## HTML files was compiled', {logFiles: true}))
       .pipe(reload({stream: true}));
});

// Таск для сборки JavaScript

gulp.task('js:build', function () {
    gulp.src(path.src.js)               //Найдем наш main файл
        .pipe(rigger())                 //Прогоним через rigger
        .pipe(sourcemaps.init())        //Инициализируем sourcemap
        .pipe(uglify())                 //Сожмем наш js
        .pipe(sourcemaps.write())       //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(count('## JS files was compiled', {logFiles: true}))
        .pipe(reload({stream: true}));
});

// Таск для сборки SCSS

gulp.task('style:build', function () {
    gulp.src(path.src.style)              //Выберем наш main.scss
        .pipe(plumber(function (error) {
            util.log(util.colors.bold.red(error.message));
            util.beep();
            this.emit('end');
        }))
        .pipe(sourcemaps.init())          //То же самое что и с js
        .pipe(sass().on('error', sass.logError)) //Скомпилируем
        .pipe(postcss([ autoprefixer() ]))//Добавим вендорные префиксы
        .pipe(cssmin())                   //Сжимаем
        .pipe(sourcemaps.write())         //Пропишем карты
        .pipe(plumber.stop())
        .pipe(gulp.dest(path.build.css))  //И в build
        .pipe(count('## files sass to css compiled', {logFiles: true}))
        .pipe(reload({stream: true}));
});

gulp.task('image:build',function () {
    gulp.src(path.src.img) //Выбираем изображения
        /*.pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))*/
        .pipe(gulp.dest(path.build.img))
        .pipe(count('## Images files was compiled', {logFiles: true}))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(count('## fonts files was compiled', {logFiles: true}))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});


gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);




















