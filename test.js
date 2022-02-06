'use strict'

const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.use('/src', express.static(path.join(__dirname)))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/test/index.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '/test/login.html'));
});

app.post('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '/test/login.html'));
});

app.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname, '/test/register.html'));
});

app.get('/refresh', function(req, res) {
  res.header({"refresh": "5; url=/register"});
  res.sendFile(path.join(__dirname, '/test/index.html'));
});

app.get('/location', function(req, res) {
  res.header({"location": "/register"});
  res.sendFile(path.join(__dirname, '/test/index.html'));
});


app.listen(port, () => {
  console.log(`vPjax test listening on port ${port}`)
})