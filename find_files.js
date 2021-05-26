const fs = require("fs")
const path = require("path");
/*
 * 
 * @param {*} dirPath 
 * @param {*} arrayOfFiles 
 * @returns 
 */
module.exports = function getAllFiles (dirPath, arrayOfFiles) {
  
    files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
          let filename = null
          filename = path.join(dirPath, "/", file)
          let re1 = /.jpg$/i;
          let re2 = /.*(_THUMB_|@eaDir|lrdata|CR2|SYNOPHOTO).*/;
          if (file.match(re1)) {
            if (!file.match(re2)){
              console.log(file)
              arrayOfFiles.push(filename)
            }
          }
      }
    })
    

    return arrayOfFiles
  }
