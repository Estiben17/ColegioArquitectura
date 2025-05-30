var express = require('express');
var cors = require('cors');
var serverless = require('serverless-http');
var port = process.env.PORT || 3000;
var app = express();
var estudiantesroutes = require('../../Backend/Routes/Estudianteroutes.js');

app.use(express.json());
app.use(cors());

var router = express.Router();
router.use('/estudiante', estudiantesroutes);

var handler = app.use ("/.netlify/functions", router);
exports.handler = serverless(app);