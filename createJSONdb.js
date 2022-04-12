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
    return axios.get(process.env.BASE_URL, {
        params: {
            apikey: process.env.API_KEY,
            i: imdbID,
            plot: 'full',
            r: 'json'
        }
    }).then(response => {
        return response.data;
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

let imdbIds = JSON.parse(fs.readFileSync(process.env.IMDB_IDS_FILE));
// Create JSON DB
imdbIds.forEach(element => {
    getById(element)
        .then(movie_data => {
            fs.stat(process.env.JSON_DB_FILE, function(err, stat) {
                if (err == null) {
                    moviesOld = JSON.parse(fs.readFileSync(process.env.JSON_DB_FILE));
                    moviesOld.push(movie_data);
                    fs.writeFileSync(process.env.JSON_DB_FILE, JSON.stringify(moviesOld));
                } else if (err.code === 'ENOENT') {
                    // file does not exist
                    fs.writeFileSync(process.env.JSON_DB_FILE, JSON.stringify([movie_data]));
                } else {
                    console.log('Some other error: ', err.code);
                }
            });
        });
});