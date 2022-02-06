'use strict'

const express = require('express')
const rateLimit = require('express-rate-limit')
const path = require('path')
const app = express()
const port = 3000

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(limiter)
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