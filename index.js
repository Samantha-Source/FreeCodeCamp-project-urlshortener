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

// Your first API endpoint
// app.get('/api/hello', function(req, res) {
//   res.json({ greeting: 'hello API' });
// });

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
    res.send({ error: 'invalid url'});
    return console.error(error);
  }

  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;

  console.log(`parsedUrl: ${parsedUrl} //// hostname: ${hostname}`);

  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error(err);
      res.status(400).send({ error: 'Invalid URL' });
      return;
    }


    console.log(`Address: ${address} Family: IPv${family}`);
    
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













app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
