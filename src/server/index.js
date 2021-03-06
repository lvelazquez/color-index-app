/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const path = require('path');
const api = require('./api');
const mockApi = require('./mock.api');

const app = express();
app.use(express.static('build', { root: '../' }));
app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../build/index.html'));
});
app.get('/getColorData', async function (req, res) {
    api.getColors()
        .then((colors) => {
            // api.getColors().then(colors=> {
            res.json(colors);
        })
        .catch((err) => {
            res.json(err);
        });
});

app.post('/setColorData', async function (req, res) {
    let data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', async function () {
        req.rawBody = data;
        req.jsonBody = JSON.parse(data);
        const success = await api.setColors(req.jsonBody);
        console.log('success', success);
        // next();
    });
    // console.log(body);
});

app.post('/updateColorData', async function (req, res) {
    let data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', async function () {
        req.rawBody = data;
        req.jsonBody = JSON.parse(data);
        const { recordId, colorInfo } = req.jsonBody;
        console.log(
            'recordId',
            recordId,
            'colorInfo',
            colorInfo.name,
            colorInfo.colors
        );
        if (recordId && colorInfo) {
            const success = await api.updateColors(recordId, colorInfo);
            console.log('success', success);
        }

        // next();
    });
});

const server = app.listen(process.env['PORT'], function () {
    const { address, port } = server.address();
    console.log('Running a API server at http://%s:%s', address, port);
});
