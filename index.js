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

function getMoviesIDsFromIMDB(url) {
    return axios.get(url)
        .then(response => {
            let html = response.data;
       
            const page = xpathHTML.fromPageSource(html);
            nodes = page.findElements("//td[contains(@class,'titleColumn')]/a");
            console.log("Number of nodes found:", nodes.length);
            let imdbIDs = [];
            nodes.forEach(element => {
                imdbIDs.push(element.getAttribute('href').split('/')[2]);
            });
            return imdbIDs;
        }).catch((err) => {
            console.error(err);
        });

}

let imdb = JSON.parse(fs.readFileSync('search_imdb.json'));
imdb.imdb.forEach(element => 
    {
        getMoviesIDsFromIMDB(element)
        .then(imdbIDs => {
            console.log(imdbIDs)
            fs.stat('imdbIDS.json', function(err, stat) {
                if(err == null) {
                    imdbIDsOld = JSON.parse(fs.readFileSync('imdbIDS.json'));
                    imdbIDs.forEach(element => {
                        if (!imdbIDsOld.includes(element)) {
                            imdbIDsOld.push(element);
                        }
                    });
                    fs.writeFileSync('imdbIDS.json', JSON.stringify(imdbIDsOld));
                } else if(err.code === 'ENOENT') {
                    // file does not exist
                    fs.writeFileSync('imdbIDS.json', JSON.stringify(imdbIDs));
                } else {
                    console.log('Some other error: ', err.code);
                }
            });
        });
        

    })
