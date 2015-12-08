var fs = require('fs');

exports.deleteFolderRecursive = function(path){
  deleteFolderRecursive(path, path);
};


function deleteFolderRecursive(path, iPath){
  if( fs.statSync(path) != null) {
    console.log(path + ' exists')
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath, iPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
  }
  if(path !== iPath)
    fs.rmdirSync(path);
};