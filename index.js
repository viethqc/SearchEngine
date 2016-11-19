var express = require('express')
var app = express()
var path = require('path');
var url = require('url');
var http = require('http');
var Promise = require('promise');

app.use(express.static(__dirname + "/bootstrap-3.3.7-dist"))
app.set('port', 9999);
app.set('views', __dirname + "/views")
app.set('view engine', 'jade')

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/views" + "/index.html");
})

app.get("/search", function(req, res){
	var objURLParse = null;
	var szPathName = "";
	var szQuery = "";
	var objQuery = null;

	objURLParse = url.parse(req.url);
	szPathName = objURLParse.pathname;
	szQuery = objURLParse.query;

	res.writeHead(200, { 'Content-Type': 'application/json' });

	objQuery = ConvertQueryToJson(szQuery);
	if (objQuery == null)
	{
		res.write("{}");
		res.end();
	}

	console.log(objQuery);

	var szResultTitle = null;
	var szResultURL = null;
	var szResultContent = null;
	var objResult = {};
	
	Query(objQuery["keyword"], "TITLE", parseInt(objQuery["p"]))
	.then(function(response){
		szResultTitle = JSON.parse(response);;
		return Query(objQuery["keyword"], "URL", parseInt(objQuery["p"]));
	})
	.then(function(response){
		szResultURL = JSON.parse(response);
		return Query(objQuery["keyword"], "CONTENT", parseInt(objQuery["p"]));
	})
	.then(function(response){
		szResultContent = JSON.parse(response);
		
		objResult.docs = [];
		objResult.docs = szResultContent.response.docs;

		objResult.total = szResultContent.response.numFound;

		console.log(objResult);
		
		res.write(JSON.stringify(objResult));
		res.end();
	})
});

app.listen(9999, function(){
	console.log("Listen in port : %d", 9999);
})

function Search(szKeyword, iPage)
{

}

function Query(szKeyword, szBy, iPage)
{
	var szQueryUrl = "";
	var szResponse = "";

	if (szKeyword === "")
	{
		return null;
	}

	if (szBy == "TITLE")
	{
		szQueryUrl = "http://localhost:8983/solr/btl-tktdtt/select?indent=on&q=title:*" + szKeyword + "*&rows=10&start="+ ((iPage - 1) * 10) +"&wt=json";
	}
	else if (szBy == "CONTENT")
	{
		szQueryUrl = "http://localhost:8983/solr/btl-tktdtt/select?indent=on&q=content:*" + szKeyword +"*&rows=10&start=" + ((iPage - 1) * 10) +"&wt=json"
	}
	else if (szBy == "URL")
	{
		szQueryUrl = "http://localhost:8983/solr/btl-tktdtt/select?indent=on&q=url:*" + szKeyword +"*&rows=10&start=" + ((iPage - 1) * 10) +"&wt=json"
	}

	return new Promise(function(resolve, reject) {
   		http.get(szQueryUrl, function(response){
			response.setEncoding("utf8");
			response.on("data", function(chunk){
				szResponse += chunk;
			});

			response.on("end", function(chunk){
				var parsedData = JSON.parse(szResponse);
	      		resolve(szResponse);
			});
		});
  	});
}

function ConvertQueryToJson(szQuery)
{
	var arrPart = [];
	var arrKeyValue = [];
	var objResult = {};

	if (szQuery === null || szQuery === "" || szQuery === undefined)
	{
		return null;
	}

	arrPart = szQuery.split("&");
	for (var i = 0; i < arrPart.length; i++)
	{
		arrKeyValue = arrPart[i].split("=");
		objResult[arrKeyValue[0]] = arrKeyValue[1];
	}

	return objResult;
}
