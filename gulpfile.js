
// var gulp = require('gulp');
// var browserSync = require('browser-sync').create();
// var nodemon = require('gulp-nodemon');

// gulp.task('server', function() {
//     nodemon({
//         script: 'app.js',
//         // 忽略部分对程序运行无影响的文件的改动，nodemon只监视js文件，可用ext项来扩展别的文件类型
//         ignore: ["gulpfile.js", "node_modules/", "public/**/*.*"],
//         env: {
//             'NODE_ENV': 'development'
//         }
//     }).on('start', function() {
//         browserSync.init({
//             proxy: 'http://localhost:3000',
//             files: ["public/**/*.*", "views/**", "routes/**"],
//             port:8080
//         }, function() {
//             console.log("browser refreshed.");
//         });
//     });
// });


var gulp = require('gulp'), 
	nodemon = require('gulp-nodemon');
 
gulp.task('server', function () {
  var stream = nodemon({ 
  	        script: 'app.js', 
  			ext: 'html js', 
  			ignore: ["gulpfile.js", "node_modules/"],
  			env: {
            'NODE_ENV': 'development'
                 }
  			});
 
  stream
      .on('restart', function () {
        console.log('restarted!');
      })
      .on('crash', function() {
        console.error('Application has crashed!\n');
         stream.emit('restart', 10);  // restart the server in 10 seconds 
      });
});