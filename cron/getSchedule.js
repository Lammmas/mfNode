#!/usr/bin/env node

//var config = require('app-config');
var parse5 = require('parse5');
var https = require('https');

// Single page: ...&ua_page=schedule&ua_gim={clubId}&week={weekNo}&nc={msTimestamp}
var url = 'https://www.myfitness.ee/ua_ajax.php?divs=ua_content&ua_page=schedule&ua_gim=3&week=52&nc=' + Date.now();

https.get(url, function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        // Because it's JSON and HTML mixed, we gotta do it the long and slow way
        var response = JSON.parse(body);
        var html = response.data.ua_content;
        var parsed = parse5.parseFragment(html);
        var locations = parsed.childNodes[1];

        var table = parsed.childNodes[3].childNodes[1].childNodes[7].childNodes;
        var titlerow = table[3].childNodes;
        var timelabelcell = titlerow[1].childNodes[0];
        var firstrow = table[5];
        var timecell = firstrow.childNodes[1].childNodes[0];
        var firstclasses = [];

        firstrow.childNodes[3].childNodes[1].childNodes.forEach(function (v, k) {
            if (v.nodeName == "a") firstclasses.push(v.childNodes[0].value);
        });

        console.log(parsed.document);
    });
}).on('error', function(e){
    console.log("Got an error: ", e);
});
