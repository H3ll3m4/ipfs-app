const ipfsClient = require('ipfs-http-client');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const ipfs = new ipfsClient({host: 'localhost', port: '5001', protocol: 'http'});
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

app.get('/',(req,res) => {
  res.render('home');
});

app.post('/upload', (req,res) => {
  const file = req.files.file;
  const fileName = req.body.fileName;
  const filePath = 'files/' + fileName;

  file.mv(filePath, async(err) => {
    try{
      const fileHash = await addFile(fileName,filePath);
    } catch (err) {
      console.log('Error: failed to upload the file');
      return res.status(500).send(err);
    }
    //We can remove the file
    fs.unlink(filePath, (err) => {
      if (err) console.log(err);
    });
    res.render('upload', {fileName, fileHash});


  })


});

  const addFile = async(fileName,filePath) => {
    try{
      const file = fs.redFileSync(filePath);
      const fileAdded = await ipfs.add({path: fileName, content:file});
      const fileHash = fileAdded[0].hash;

    } catch (err) {
      //res.status(error.response.status)
      //return res.send(error.message);
      console.log('Error: failed to add file');
      return res.status(500).send(err);
    }


  return fileHash
}

app.listen(3000,() => {
  console.log('Server is listening on port 3000');
});
