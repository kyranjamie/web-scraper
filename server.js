var express = require('express'),
request = require('request'),
cheerio = require('cheerio'),
fs = require('fs'),
app = express();

var allComments = [];
var TIMEOUT = 6000;

app.get('/scrape', function(req, res){

  var i = 0;
  function timeoutLoop () {
    setTimeout(function () {

      i++;
      if (i < 20) {
        url = 'http://someurl.com?page=' + i + '&otherParams';
        request(url, function(error, response, html){
          if(!error){
            var $ = cheerio.load(html);
            $('.FullShareChat').filter(function () {
              $('.FullChatPost').each(function () {
                var data = $(this);
                allComments.push({
                  comment : data.find('.FullChatText').text(),
                  name: data.find('.FullChatInfo a strong').text(), 
                  opinion: data.find('.FullChatInfo span table tr:first-child td:last-child').text(),
                  date: data.find('.FullChatDate').text()
                });
              });
            });
          }
        });

        console.log('Scraping page: ', i);

        timeoutLoop();
      }
      if (i == 20) {
        fs.writeFile('output.json', JSON.stringify(allComments), function(err) {
          if (err) console.log(err);
        });
        console.log('Output written to disk');
      }
    }, TIMEOUT);
  }

  timeoutLoop();
});

app.listen('8889');
console.log('Open port 8889. Req /scrape');
exports = module.exports = app;   