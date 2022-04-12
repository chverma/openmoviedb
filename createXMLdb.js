const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

let specialKeys = ['Runtime', 'Ratings', 'Awards', 'Writer', 'Actors', 'Language', 'Released', 'Director', 'Country'];

function createXMLMovie(doc, movie) {
    let newMovie = doc.createElement('movie');
    Object.keys(movie).forEach(key => {
        let newNode = doc.createElement(key);
        let values;
        switch (key) {
            case 'Runtime':
                values = movie[key].split(' ')
                if (values.length > 1) {
                    newNode.setAttribute('time', values[1]);
                    newNode.textContent = values[0];
                } else {
                    newNode.textContent = movie[key];
                }
                break;
            case 'Genre':
            case 'Writer':
            case 'Actors':
            case 'Director':
            case 'Language':
            case 'Country':
            case 'Awards':
                if (key == 'Awards') {
                    values = [];
                    vals = movie[key].split('. ');
                    values.push(vals[0]);
                    if (vals[1]) {
                        vals = vals[1].split(' & ');
                        values.push(vals[0]);
                        values.push(vals[1]);
                    }
                    key = 'Award'
                } else
                    values = movie[key].split(', ');
                if (key == 'Actors') key = 'Actor';
                if (key == 'Country')
                    newNode = doc.createElement('Countries');
                else
                    newNode = doc.createElement(key + 's');
                values.forEach(e => {
                    let newNodeChild = doc.createElement(key);
                    newNodeChild.textContent = e;
                    newNode.appendChild(newNodeChild);
                });
                break;
            case 'Ratings':
                movie[key].forEach(rat => {
                    newNodeChild = doc.createElement('Rating');
                    newNodeChild.setAttribute('source', rat.Source);
                    newNodeChild.textContent = rat.Value;
                    newNode.appendChild(newNodeChild);
                })

                break;
            case 'Released':
                newNode.textContent = new Date(Date.parse(movie[key])).toLocaleDateString();
                break;
            default:
                newNode.textContent = movie[key];
        }
        if (key != 'Response')
            newMovie.appendChild(newNode);
    })

    /*
            <ratings>
                <rating src="Internet Movie Database">8.6/10</rating>
                <rating src="Rotten Tomatoes">82%</rating>
                <rating src="Metacritic">65/100</rating>
            </ratings>*/

    doc.documentElement.appendChild(newMovie);
}

let movies = JSON.parse(fs.readFileSync(process.env.JSON_DB_FILE));
// Create XML DB
var doc = new DOMParser()
    .parseFromString('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><movies></movies>', 'text/xml');
movies.forEach(element => {
    createXMLMovie(doc, element);
});

var s = new XMLSerializer();
var str = s.serializeToString(doc);
fs.writeFileSync(process.env.XML_DB_FILE, str);