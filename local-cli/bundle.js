var http = require('http');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var blacklist = require('../packager/blacklist.js');
var ReactPackager = require('../packager/react-packager');

var OUT_PATH = 'iOS/main.jsbundle';

function getBundle(flags) {

  var outPath = flags.out ? flags.out : OUT_PATH;

  var projectRoots = [path.resolve(__dirname, '../../..')];
  if(flags.root){
    projectRoots.push(path.resolve(flags.root));
  }

  var assetRoots = [path.resolve(__dirname, '../../..')];
  if(flags.assetRoot){
    assetRoots.push(path.resolve(flags.assetRoot));
  }


  var options = {
    projectRoots: projectRoots,
    transformModulePath: require.resolve('../packager/transformer.js'),
    assetRoots: assetRoots,
    cacheVersion: '2',
    blacklistRE: blacklist('ios'),
  };

  var url = '/index.ios.bundle?dev=' + flags.dev;

  console.log('Building package...');
  ReactPackager.buildPackageFromUrl(options, url)
    .done(function(bundle) {
      console.log('Build complete');
      fs.writeFile(outPath, bundle.getSource({
        inlineSourceMap: false,
        minify: flags.minify
      }), function(err) {
        if (err) {
          console.log(chalk.red('Error saving bundle to disk'));
          throw err;
        } else {
          console.log('Successfully saved bundle to ' + outPath);
        }
      });
    });
}

function showHelp() {
  console.log([
    'Usage: react-native bundle [options]',
    '',
    'Options:',
    '  --dev\t\tsets DEV flag to true',
    '  --minify\tminify js bundle',
    '  --root\t\tadd another root(s) to be used in bundling in this project',
    '  --assetRoot\t\tspecify the root directory of app assets',
    '  --out\t\tspecify the output file',
  ].join('\n'));
  process.exit(1);
}

module.exports = {
  init: function(args) {
    var flags = {
      help: args.indexOf('--help') !== -1,
      dev: args.indexOf('--dev') !== -1,
      minify: args.indexOf('--minify') !== -1,
      root: args.indexOf('--root') !== -1 ? args[args.indexOf('--root') + 1] : false,
      assetRoot: args.indexOf('--assetRoot') !== -1 ? args[args.indexOf('--assetRoot') + 1] : false,
      out: args.indexOf('--out') !== -1 ? args[args.indexOf('--out') + 1] : false,
    }

    if (flags.help) {
      showHelp();
    } else {
      getBundle(flags);
    }
  }
}
