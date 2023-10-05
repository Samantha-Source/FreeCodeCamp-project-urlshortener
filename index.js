require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
// const { ObjectId } = require('mongodb');
const mongoURI = process.env.MONGO_URI;
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: String,
})

let URL = mongoose.model('URL', urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
