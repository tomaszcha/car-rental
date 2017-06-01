const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const nedb = require('nedb');
const port = 8080;
const server = express();

var cars = new nedb({
    filename: 'db/cars.db',
    autoload: true
});

var rentals = new nedb({
    filename: 'db/rentals.db',
    autoload: true
});

server.use(express.static('public'));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));


server.post('/api/cars', (req, res) => {
    var car = req.body;
    car.rented = 'false';
    cars.insert(car);
    res.end();
});

server.get('/api/cars', (req, res) => {
    cars.find(req.query || {}, function (err, docs) {
        res.json(docs);
    });
});

server.delete('/api/cars/:carId', (req, res) => {
    cars.remove({
        _id: req.params.carId
    });
    res.end();
});

server.post('/api/cars/:carId/return', (req, res) => {
    cars.findOne({
        _id: req.params.carId
    }, function (err, car) {
        car.rented = 'false';
        cars.update({
            _id: car._id
        }, car);
        res.end();
    });
});

server.post('/api/rentals', (req, res) => {
    cars.findOne({
        _id: req.body.carId
    }, function (err, doc) {
        if (err || !doc || doc.rented === 'true') {
            return res.status(400).end();
        }

        doc.rented = 'true';
        cars.update({
            _id: req.body.carId
        }, doc, {});
        rentals.insert(req.body);
        res.end();
    });
});

server.get('/api/rentals', (req, res) => {
    rentals.find(req.query || {}, function (err, docs) {
        res.json(docs);
    });
});

server.get('/api/rentedCars', (req, res) => {
    cars.find({
        rented: 'true'
    }, function (err, cars) {
        var ids = cars.map(car => car._id);
        rentals.find({carId: {$in:ids}}, function (err, rentals) {
            var map = {};
            rentals.forEach(rental => map[rental.carId] = rental);
            cars.forEach(car => car.rental = map[car._id]);
            res.json(cars);
        });
    });
});

server.listen(port);