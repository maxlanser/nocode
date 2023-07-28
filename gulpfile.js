const { src, dest, series, parallel, watch } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const rename = require("gulp-rename");
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const avif = require('gulp-avif');
const newer = require('gulp-newer');
const woff = require('gulp-ttf2woff');
const woff2 = require('gulp-ttf2woff2');
const babel = require("gulp-babel");
const concat = require('gulp-concat');
const gulpBabelMinify = require('gulp-babel-minify');
const svgSprite = require('gulp-svg-sprite');
const gcmq = require('gulp-group-css-media-queries');
const csscomb = require('gulp-csscomb');
const zip = require('gulp-zip');
const plumber = require('gulp-plumber');


function archive(){
  return src('./dist/*')
    .pipe(zip('dist.zip'))
    .pipe(dest('./'));
}

function cleanDev(){
  return src('./dist/', {read: false, allowEmpty: true})
      .pipe(clean());
}

function bSync(done) {
  browserSync.init({
    server: {
        baseDir: "./dist"
    },
    open: false,
    watch: true,
    files: ['./src/**/*.*']
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}


function generateSprire() {
  const svgspriteConfig = {
    mode: {
      css: { // Activate the «css» mode
        render: {
          scss: true // Activate CSS output (with default options)
        },
        dest: 'scss/',
        dimensions: true,
        sprite: '../images/sprite.svg',
        prefix: '.svg-icons--%s',
        bust: false
      }
    }
  };
  return src('./src/images/icons/*.svg')
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(svgSprite(svgspriteConfig))
    .pipe(dest('./src/'));
}

function copySprite() {
  return src('./src/images/sprite.svg', {read: false, allowEmpty: true})
    .pipe(dest('./dist/images'));
}

function copyVideo() {
  return src('./src/video/*.*', {allowEmpty: true})
    .pipe(dest('./dist/video'));
}

function images() {
  return src(['./src/images/**/*.+(jpg|JPG|png|PNG|svg)','!./src/images/icons/*.svg'])
    .pipe(newer('./dist/images'))
    .pipe(imagemin([
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(dest('./dist/images/'));
}

function images2webp(){
  return src('./src/images/**/*.+(jpg|JPG|png|PNG)')
    .pipe(newer('./dist/images'))
    .pipe(webp())
    .pipe(dest('./dist/images'));
}

function images2avif(){
  return src('./src/images/**/*.+(jpg|JPG|png|PNG)')
    .pipe(newer('./dist/images'))
    .pipe(avif({
      quality: 50
    }))
    .pipe(dest('./dist/images'));
}

function fonts2woff(){
  return src('./src/fonts/*.ttf')
    .pipe(woff())
    .pipe(dest('./dist/fonts'));
}
function fonts2woff2(){
  return src('./src/fonts/*.ttf')
    .pipe(woff2())
    .pipe(dest('./dist/fonts'));
}


function script(){
  return src([
    "./src/js/libs/*.js",
    "./node_modules/swiper/swiper-bundle.min.js",
    "./src/js/plugins/*.js",
    "./src/js/modules/*.js",
    "./src/js/main.js"
    ])
    // .pipe(babel({
    //   presets: ["@babel/preset-env"]
    // }))
    .pipe(concat('app.js'))
    //.pipe(gulpBabelMinify())
    .pipe(dest("./dist/js"));
}

function pugTask(){
  return src('./src/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(
      pug({
        basedir: './src/pug/',
        pretty: true
      })
    )
    .pipe(dest('./dist'));
}

function styles() {
  return src('./src/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
			cascade: false
		}))
    .pipe(rename('style.css'))
    .pipe(csscomb())
    .pipe(gcmq())
    .pipe(dest('./dist/css'))
    .pipe(browserSync.stream());
};


function watching() {
  watch('./src/pug/**/*.pug', pugTask);
  watch('./src/scss/**/*.+(scss|css)', styles);
  watch('./src/js/**/*.js', script);
  watch('./src/images/**/*.+(jpg|JPG|png|PNG|svg)', images);
  watch('./src/images/icons/*.svg', series(generateSprire, copySprite, styles));
}

exports.html = pugTask;
exports.styles = styles;
exports.cleandev = cleanDev;
exports.archive = archive;

exports.default = series(
  cleanDev,
  parallel(
      pugTask,
      script,
      images,
      copyVideo,
      series(generateSprire, copySprite, styles),
      //images2webp,
      //images2avif,
      //fonts2woff,
      //fonts2woff2
    ),
  bSync,
  watching
);
