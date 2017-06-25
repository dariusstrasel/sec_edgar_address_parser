/**
 * Created by dariusstrasel on 6/24/17.
 */
var https = require('https');
const { URL } = require('url');
var cheerio = require('cheerio');
fs = require('fs');

function getLiveHTML(companyName, callback) {
    console.log("company: ", companyName);
    if (companyName) {
        const url = new URL('https://www.sec.gov/cgi-bin/browse-edgar?company=' + companyName + '&owner=exclude&action=getcompany');

        var req = https.get(url, handleRequest);
        req.on('error', handleError);

        function handleError(error) {
            console.log('ERROR: ' + error.message);
        }

        function handleRequest(response) {
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));

            // Buffer the body entirely for processing as a whole.
            var bodyChunks = [];
            response.on('data', function (chunk) {
                // You can process streamed parts here...
                bodyChunks.push(chunk);
            }).on('end', function () {
                return callback(Buffer.concat(bodyChunks))
            })
        }
    }
}

function parseBusinessAddress(html){
  $ = cheerio.load(html);
  console.log("Returning html...");
  var addressLines  = [];
  var result = $('div.mailer')
          .find('span.mailerAddress')
          .each( function(index, element) {
              addressLines.push(cleanLine($(this).text()))
          });

  //console.log(result);
  return addressLines.slice(2, addressLines.length);
}

function cleanLine(line){
    newLine = line.trim();
    newLine = newLine.replace("\n", "");
    return newLine
}

function main(companyName){
    var html = getLiveHTML(companyName, parseBusinessAddress);
    return html;
    //console.log("html: ", html);
    //console.log(getHTML('./src.html', startParser));
}

module.exports = {
    getSymbolAddress: main
};