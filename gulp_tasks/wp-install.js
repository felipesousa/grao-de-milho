var gulp            = require( 'gulp' ),
    request         = require( 'request' ),
    zlib            = require( 'zlib' ),
    fs              = require( 'fs' ),
    AdmZip          = require( 'adm-zip' ),
    readlineSync    = require('readline-sync'),
    helper 		      = require('./helpers'),
    fileUrl         = 'https://wordpress.org/latest.zip',
    output          = 'latest.zip';

// WP Install
gulp.task('wp-install', function() {
  var packageJson = gulp.config.packageJson,
      initialized = helper.fileExists( './wordpress/index.php' );
      projectName = process.argv.splice( process.argv.indexOf( '--p' ) )[1];

  if( packageJson.name === 'grao-de-milho' ) {

    helper.log('Set the project name using gulp init --p "[Project Name]".', 'danger');
    helper.log('Stoping...', 'danger');
    process.exit();

  } else {

    if(initialized) {
      helper.log('Ops! Wordpress is already installed.', 'danger');
      var answer = readlineSync.question('Do you want to reinstall wordpress? (Y or N) ');
      if(['N', 'NO'].indexOf(answer.toUpperCase()) >= 0) {
        helper.log('Stoping...', 'danger');
        process.exit();
      } else if(['Y', 'YES'].indexOf(answer.toUpperCase()) < 0) {
        helper.log('Answer unexpected', 'danger');
        helper.log('Stoping...', 'danger');
        process.exit();
      }
    }

    helper.log('Downloading wordpress...', 'success');

    // Install WP
    var req = request({
        url: fileUrl,
        encoding: null
      }, function(err, resp, body) {
        if(err) throw err;
        fs.writeFile( output, body, function(err) {
          helper.log('Unzipping wordpress...', 'success');
          var zip = new AdmZip(output);
          zip.extractAllTo( './' );
          fs.unlink( output );
          helper.log('Coping wp-config...', 'success');
          fs.createReadStream('./wp-config.php').pipe(fs.createWriteStream('./wordpress/wp-config.php'));
          gulp.start('wp-build');
        });
      });
    }
});

