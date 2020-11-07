/* eslint-disable no-console */
require('dotenv').config()
const express = require('express')
const path = require('path')
const api = require("./api");
const mockApi = require("./mock.api");

const app = express()
app.use(express.static('build', { root: '../' }))
app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, '../build/index.html'))
})
app.get("/colorData", async function(req, res) {
  mockApi.getColors().then(colors=> {
  // api.getColors().then(colors=> {
    res.json(colors);
  }).catch(err=> {
    res.json(err);
  });  
})

const server = app.listen(process.env.PORT, function () {
  const { address, port } = server.address()
  console.log('Running a API server at http://%s:%s', address, port)
})

