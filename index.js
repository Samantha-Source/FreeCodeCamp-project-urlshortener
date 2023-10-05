require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;
const app = express();

const port = process.env.PORT || 3000;

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: String,
})

let URLModel = mongoose.model('URLModel', urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



async function createAndSaveURL(url) {
  try {
    const result = await url.save({
      _id: url._id,
      original_url: url.original_url,
      short_url: url._id.toString(),
    });
  } catch (error) {
    console.error('Error saving URL:', error);
    throw new Error('Error saving URL');
  }
}


app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  try {
    const parsedUrl = new URL(url);
  } catch (error) {
    res.json({ error: 'invalid url'});
    return console.error(error);
  }

  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;

  // console.log(`parsedUrl: ${parsedUrl} //// hostname: ${hostname}`);

  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error(err);
      res.json({ error: 'invalid URL' });
      return;
    }

    // console.log(`Address: ${address} Family: IPv${family}`);
    
    const newURL = new URLModel({
      original_url: parsedUrl,
    })

    newURL.short_url = newURL._id;

    try {
      createAndSaveURL(newURL);
      res.send({ original_url: url, short_url: newURL._id })
    } catch (error) {
      res.status(500).send({ error: 'invalid url'});
    }

  });
})

app.get('/api/shorturl/:shorturl', async (req, res, next) => {
  const { shorturl } = req.params
  try {
    var result = await URLModel.find({ short_url: shorturl });

    if (!result) {
      res.status(404).send('URL not found');
      return;
    }

    const { original_url } = result[0];
    res.redirect(original_url);
  } catch (error) {
    console.error('Error finding url:', error);
    throw new Error('Error finding url');
  }



})













app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
