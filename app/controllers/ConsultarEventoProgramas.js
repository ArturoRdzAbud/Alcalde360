const model = require('../models/ConsultarEventoProgramas.js');
const url = require('url');

exports.get = async(req, res) => {
    const params = url.parse(req.url, true).query;
    const data = await model.ConsultarEventoProgramas(params)
    res.setHeader('Acces-Control-Allow-Origin', '*');
    res.setHeader('Acces-Control-Allow-Methods', 'GET');
    res.setHeader('content-type','application/json; charset=utf-8');
    res.json(data);
}