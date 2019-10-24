const { src, dest, watch, series, parallel } = require('gulp');
//有gulp前綴的插件不用宣告的功能
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
require('dotenv').config()
//clean開發時的資料夾
function clean() {
  return src(['./public'], {
    allowEmpty: true,
    read: false
  })
    .pipe($.clean());
}

// 自動轉出html到public(沒用jade的時候可以用)
// gulp.task('copyHTML', function () {
//   return gulp.src('./source/**/*.html')
//     .pipe(gulp.dest('./public/'))
//     .pipe(browserSync.stream());
// })

function pug() {
  return src(['./source/**/*.pug', '!./source/partials/*.pug'])
    .pipe($.plumber())
    .pipe($.data(function(){    //載入資料
      let taipeiData = require('./source/data/xmlData.json');
      let source = {
        taipeiData:taipeiData
      }
      return source;
    }))
    .pipe($.pug({
      pretty: true //未壓縮
    }))
    .pipe(dest('./public/'))
    .pipe(browserSync.stream());
};

// 編譯sass格式(包含prefix、sourcemap、壓縮css功能)
function sass() {
  //在json檔設定prefix的瀏覽器範圍

  return src('./source/scss/all.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
        //載入外部第三方程式碼，在all.scss處理
    //   'includePaths': ['./node_modules/bootstrap/scss']
    }).on('error', $.sass.logError))
    .pipe($.postcss())
    .pipe($.if(process.env.NODE_ENV === 'production', $.cleanCss()))
    .pipe($.sourcemaps.write('.'))
    .pipe(dest('./public/css'))
    .pipe(browserSync.stream());
};

// 編譯JS es6格式
function babel() {
  return src('./source/js/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    // .pipe($.concat('all.js'))
    .pipe($.babel({
      presets: ['env']
    }))
    .pipe($.if(process.env.NODE_ENV === 'production', $.uglify({
      compress: {
          //把console.log拿掉
        drop_console: true
      }
    })))
    .pipe($.sourcemaps.write('.'))
    .pipe(dest('./public/js'))
    .pipe(browserSync.stream());
};


function vendorJS() {
  return src(['./node_modules/jquery/dist/jquery.js', './node_modules/bootstrap/dist/js/bootstrap.bundle.js','./node_modules/swiper/js/swiper.js','./source/js/fontAwesome.min.js'])
    //合併前先做排序
    .pipe($.order([
      'jquery.js',
      'bootstrap.bundle.js',
      'swiper.js',
      'fontAwesome.min.js',
    ]))
    .pipe($.concat('vendors.js'))
    .pipe($.if(process.env.NODE_ENV === 'production', $.uglify()))
    .pipe(dest('./public/js'))
};

// 圖片壓縮
function imageMin() {
  return src('./source/images/**/*')
    .pipe($.if(process.env.NODE_ENV === 'production', $.imagemin()))
    .pipe(dest('./public/images'))
};

// 搬移 json 檔到 public
function copyJSONFiles() {
  return src('./source/json/**/*.json')
    .pipe(dest('./public/json'))
    .pipe(browserSync.stream());
};

// 搬移 fonts 到 public
function copyFontsFiles() {
  return src('./source/fonts/*')
    .pipe(dest('./public/fonts'));
};

// 網頁伺服器
function runBrowserSync() {
  browserSync.init({
    server: {
      baseDir: "./public"
    },
    reloadDebounce: 2000 //設定reload時間間隔
  });
};

// 自動監聽檔案的變更(監聽來源,任務名稱)
function watchFiles() {
  watch('./source/json/**/*.json', copyJSONFiles);
  watch('./source/**/*.pug', pug);
  watch(['./source/scss/**/*.scss','./node_modules/bootstrap/scss/**/*.scss'], sass);
  watch('./source/js/**/*.js', babel);
};

// 自動發布public到github page
function deploy() {
  return src('./public/**/*')
    .pipe($.ghPages());
};

// 專案完成時的導出任務
exports.build = series(clean, sass, babel, vendorJS, imageMin, copyJSONFiles, copyFontsFiles);

exports.deploy = deploy;

// 預設輸入gulp，一次啟動所有gulp任務
exports.default = parallel( sass, babel, vendorJS, imageMin, copyJSONFiles, copyFontsFiles, watchFiles);