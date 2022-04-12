const fs = require('fs');
require('dotenv').config();
const axios = require('axios');
const xpathHTML = require("xpath-html");

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

let imdb = JSON.parse(fs.readFileSync(process.env.URLS_IMDB_FILE));
imdb.imdb.forEach(element => {
    getMoviesIDsFromIMDB(element)
        .then(imdbIDs => {
            fs.stat(process.env.IMDB_IDS_FILE, function(err, stat) {
                if (err == null) {
                    imdbIDsOld = JSON.parse(fs.readFileSync(process.env.IMDB_IDS_FILE));
                    imdbIDs.forEach(element => {
                        if (!imdbIDsOld.includes(element)) {
                            imdbIDsOld.push(element);
                        }
                    });
                    fs.writeFileSync(process.env.IMDB_IDS_FILE, JSON.stringify(imdbIDsOld));
                } else if (err.code === 'ENOENT') {
                    // file does not exist
                    fs.writeFileSync(process.env.IMDB_IDS_FILE, JSON.stringify(imdbIDs));
                } else {
                    console.log('Some other error: ', err.code);
                }
            });
        });


})