var express = require('express'); 
const yargs = require('yargs');
var url = require('url');
const fs = require("fs")

var app = express();
var ff = require("./find_files.js");
const path = require("path");
var im = require('imagemagick');
var ExifImage = require('exif').ExifImage;
var _ = require('underscore');
const { collect, result } = require('underscore');
const { exit } = require('process');
var apiResponseData = [];
var htmlResponseData = [];
const port = 8098
//const photo_root = '/volume1/photo/'
//const pub_dir = '/public/photo'
var photo_root = process.env.PHOTO_ROOT 
var pub_dir = process.env.PUBLIC_DIR 



    if (photo_root == null || photo_root == ""){
     //console.log(`photo_root not found ${photo_root}`)
    //exit();
    photo_root = '/volume1/photo/';
    }

    if (pub_dir == null || pub_dir == ""){
    //console.log(`photo_dir not found ${pub_dir}`)
    //exit();
    pub_dir = '/public/photo';
    }

var public_dir = require('path').join(__dirname,pub_dir); 
//console.log(__dirname)
//console.log(publicDir)
app.use(express.static(public_dir));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var images = [];
var filePath= "./images.json";

if (fs.existsSync(filePath)){
    images = JSON.parse(fs.readFileSync(filePath));
    console.log(images);
} else {
    //get images
    images = new ff(photo_root);
    //write to file
    fs.writeFile (
        './images.json',
        JSON.stringify(images), 
        function (err){
          if (err){
            console.error(`cant write data to images.json${err}`)
          }
        }
  
      );

}




var img_exif = "";

/////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    var item = req.query.item;
    var images_list = [];
    console.log(`item=${item}...`)
    if (item == null || item == ""){
        item = 16;
    }
    var i=1;
    var col = 4;
    var ppc = 4;
    var row = Math.floor(parseInt(item)/col/ppc);

    var return_images_list = _.sample(images,parseInt(item));
    return_images_list.forEach (async function(img) {
        img_full=img;
        img = img.replace(photo_root,"");
        var data = {"image":img, "id":i++}
        images_list.push(data);
    })
    htmlResponseData.push(row)
    htmlResponseData.push(col)
    htmlResponseData.push(ppc)
    htmlResponseData.push(images_list)
    console.log(htmlResponseData)
    res.render('images', {data:htmlResponseData});
    htmlResponseData=[];
    
})

////////////////////////////////////////////////////////////////////
app.get('/api', (req, res) => {
    var item = req.query.item;
    var images_list = [];
    console.log(`item=${item}...`)
    if (item == null || item == ""){
        item =1;
    }
    var i=1;
    var return_images_list = _.sample(images,parseInt(item));
    return_images_list.forEach (async function(img) {
        img_full=img;
        img = img.replace(photo_root,"");
        console.log(`returning image ${img}...`)
        // img_exif = await getExifData(img_full)
        // .then( (value)=>{ 
        //     const jsonStr = JSON.stringify(value);
        //     const data = JSON.parse(jsonStr);
        //     return data.image;
        // })
        
        // console.log(img.exif);
        var data = {"url": fullUrl(req) + img, "id":i.toString()}    
        //images_list.push(data);
        apiResponseData.push(data);
        i++;
    })
  
    //apiResponseData.push(images_list)
    console.log(apiResponseData)
    res.send(apiResponseData);
    apiResponseData=[];
})
/////////////////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`starting photo album server at http://localhost:${port}`)
})
  
///////////////////////////////////////////////////////////////////////////////////////
async function getExifData(img_full){
    return new Promise((resolve, reject) => { 
        //console.log(`looking for data for ${img_full}...`)
        try {
             new ExifImage({ image : img_full }, function (error, exifData) {
                if (error)
                    console.log('Error: '+error.message);
                else
                   return resolve(exifData);
            });
        } catch (error) {
            console.log('Error: ' + error.message);
        }
    })

}
//////////////////////////////////////////////////////////////////////
function fullUrl(req) {
    return url.format({
      protocol: req.protocol,
      host: req.get('host'),
       pathname: '/'
      //pathname: req.originalUrl
    });
  }