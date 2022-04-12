const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const xpath = require('xpath');
const xpathHTML = require("xpath-html");
const dom = require('xmldom').DOMParser;
const path = require('path');

function search(title) {
    axios.get(process.env.BASE_URL, {
        params: {
            apikey: process.env.API_KEY,
            s: title
        }
    }).then(response => {
        console.log(response.data);
    }).catch((err) => {
        console.error(err);
    });
};

function getById(imdbID) {
    axios.get(process.env.BASE_URL, {
        params: {
            apikey: process.env.API_KEY,
            i: imdbID,
            plot: 'full',
            r: 'xml'
        }
    }).then(response => {
        console.log(response.data);
    }).catch((err) => {
        console.error(err);
    });
};


function readFromFile(filename) {
    let data = JSON.parse(fs.readFileSync(filename));
    let movies = data.Search;
    movies.forEach(element => {
        console.log(element.imdbID);
    });
}

//readFromFile('example_search.json');