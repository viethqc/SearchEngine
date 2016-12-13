var express = require('express')
var app = express()
var path = require('path');
var url = require('url');
var http = require('http');
var Promise = require('promise');
var async = require('async');
var DOMAIN = "http://localhost:8983/solr/btl-tktdtt/select?";
//var process = require('process');

app.use(express.static(__dirname + "/bootstrap-3.3.7-dist"))
app.use(express.static(__dirname + "/public"))
app.set('port', 9999);
app.set('views', __dirname + "/views")
app.set('view engine', 'jade')

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/views" + "/index.html");
})

app.get('/search', function(req, res) {
	res.sendFile(__dirname + "/views" + "/index.html");
})

process.on('uncaughtException', function(ex) {
	console.log(ex);
});

app.get("/searchapi", function(req, res){

	try
	{
		var objURLParse = null;
		var szPathName = "";
		var szQuery = "";
		var objQuery = null;

		console.log("origin url : " + req.url);
		var uri_dec = decodeURIComponent(req.url);
		console.log("origin decoded : " + uri_dec);

		objURLParse = url.parse(uri_dec);
		szPathName = objURLParse.pathname;
		szQuery = decodeURIComponent(objURLParse.query);

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
		var szURL = "";
		var arrTitleCode = [];
		var arrContentCode = [];
		var szDate = "";
		var szDropwordTitle = "";
		var szDropwordContent = "";
		var szTitleMath = "";
		var szContentMath = "";
		var szTitleNomal = "";
		var szContentNormal = "";

		var arrTitleSearch = [];
		var arrContentSearch = [];
		var szTitleQuery = "";
		var szContentQuery = "";

		for (var i = 0; i < 10; i++)
		{
			arrTitleSearch[i] = "";
			arrContentSearch[i] = "";
		}

		//Search Normal
		if (objQuery["keyword"] !== "")
		{
			arrTitleSearch[0] = "title:\"" + objQuery["keyword"] + "\"~3";
			arrContentSearch[0] = "content:\"" + objQuery["keyword"] + "\"~3";
		}

		if (objQuery["match"] !== "")
		{
			arrTitleSearch[1] = "title:\"" + objQuery["match"] + "\"";
			arrContentSearch[1] = "content:\"" + objQuery["match"] + "\"";
		}

		if (objQuery["dropword"] !== "")
		{
			arrTitleSearch[2] = "-title:\"" + objQuery["dropword"] + "\" AND -content:\"" + objQuery["dropword"] + "\"";
			arrContentSearch[2] = "-title:\"" + objQuery["dropword"] + "\" AND -content:\"" + objQuery["dropword"] + "\"" ;
		}

		if (objQuery["datestart"] !== "" && objQuery["dateend"] !== "")
		{
			arrTitleSearch[3] += "date:[" + objQuery["datestart"] +"T00:00:00Z%20TO%20" + objQuery["dateend"] + "T23:59:59Z]";
			arrContentSearch[3] += "date:[" + objQuery["datestart"] +"T00:00:00Z%20TO%20" + objQuery["dateend"] + "T23:59:59Z]";
		}

		if (objQuery["any-word"] !== "")
		{
			arrTitleSearch[4] = "title:(" + objQuery["any-word"] + ")";
			arrContentSearch[4] = "content:(" + objQuery["any-word"] + ")";
		}

		if (objQuery["search-all"] !== "")
		{
			arrTitleSearch[5] = "title:(" + objQuery["search-all"] + ")";
			arrContentSearch[5] = "content:(" + objQuery["search-all"] + ")";
		}

		for (var i = 0; i < arrTitleSearch.length; i++)
		{
			if (arrTitleSearch[i] === "" ||  i == 3)
			{
				continue;
			}

			if (i != 0 && i != arrTitleSearch.length - 1)
			{
				if (szTitleQuery !== "")
				{
					szTitleQuery += " AND ";
				}
			}

			szTitleQuery += arrTitleSearch[i];
		}

		for (var i = 0; i < arrContentSearch.length; i++)
		{
			if (arrContentSearch[i] === "" ||  i == 3)
			{
				continue;
			}

			if (i != 0 && i != arrContentSearch.length - 1)
			{
				if (szContentQuery !== "")
				{
					szContentQuery += " AND ";
				}
			}

			szContentQuery += arrContentSearch[i];
		}

		if (objQuery["datestart"] !== "" && objQuery["dateend"] !== "")
		{
			szTitleQuery += " AND ";
			szTitleQuery = encodeURI(szTitleQuery);
			szTitleQuery += arrTitleSearch[3];
		}
		else
		{
			szTitleQuery = encodeURI(szTitleQuery);
		}

		
		if (objQuery["datestart"] !== "" && objQuery["dateend"] !== "")
		{
			szContentQuery += " AND ";
			szContentQuery = encodeURI(szContentQuery);
			szContentQuery += arrContentSearch[3];
		}
		else
		{
			szContentQuery = encodeURI(szContentQuery);
		}

		//So khop
		// var szTitle = "";
		// if (objQuery["match"] !== "")
		// {
		// 	// console.log("advance search");
		// 	// objQuery["keyword"] = "\"" + objQuery["keyword"] + "\"";
		// 	szTitleMath = " AND title:\"" + objQuery["match"] + "\"" ;
		// 	szContentMath = " AND content:\"" + objQuery["match"] + "\"" ;
		// }

		// if (objQuery["dropword"] !== "")
		// {
		// 	szDropwordTitle = " AND -title:\"" + objQuery["dropword"] + "\"" ;
		// 	szDropwordContent = " AND -content:\"" + objQuery["dropword"] + "\"" ;
		// }

		//Truy van theo ngay
		// if (objQuery["datestart"] !== "" && objQuery["dateend"] !== "")
		// {
		// 	szDate += " AND date:[" + objQuery["datestart"] +"T00:00:00Z%20TO%20" + objQuery["dateend"] + "T23:59:59Z]";
		// }

		szURL = DOMAIN + "fl=code&indent=on&q=" + szTitleQuery + "&rows=0&wt=json";
		console.log(szURL);
		QueryByURL(szURL).then(function(response){
			response = JSON.parse(response);
			console.log("title : " + response["response"]["numFound"]);

			szURL = DOMAIN + "fl=code&indent=on&q=" + szTitleQuery + "&rows=" + response["response"]["numFound"] + "&wt=json";
			console.log(szURL);
			return QueryByURL(szURL);
		})
		.then(function(response){
			response = JSON.parse(response);
			for (var i = 0; i < response["response"]["docs"].length; i++)
			{
				arrTitleCode.push(response["response"]["docs"][i]["code"]);
			}

			szURL = DOMAIN + "fl=code&indent=on&q=" + szContentQuery + "&rows=0&wt=json";
			console.log(szURL);
			return QueryByURL(szURL);
		})
		.then(function(response){
			response = JSON.parse(response);
			console.log("content : " + response["response"]["numFound"]);

			szURL = DOMAIN + "fl=code&indent=on&q=" + szContentQuery + "&rows=" + response["response"]["numFound"] + "&wt=json";
			console.log(szURL);
			return QueryByURL(szURL);
		})
		.then(function(response){
			response = JSON.parse(response);
			for (var i = 0; i < response["response"]["docs"].length; i++)
			{
				arrContentCode.push(response["response"]["docs"][i]["code"]);
			}

			for (var i = 0; i < arrContentCode.length; i++)
			{
				if (arrTitleCode.indexOf(arrContentCode[i]) != -1)
				{
					continue;
				}

				arrTitleCode.push(arrContentCode[i]);
			}

			objResult.total = arrTitleCode.length;
			objResult.docs = [];
			var iStart = (parseInt(objQuery["p"]) - 1) * 10;
			var iEnd = -1;
			if (arrTitleCode.length - iStart > 10)
			{
				iEnd = iStart + 10;
			}
			else
			{
				iEnd = arrTitleCode.length;
			}

			console.log("total :" + arrTitleCode.length);
			console.log("page : " + objQuery["p"]);
			console.log("start : " + iStart);
			console.log("end : " + iEnd);

			var arrPromise = [];
			var szURL = "";
			var json;

			for (var i = iStart; i < iEnd; i++)
			{
				console.log(arrTitleCode[i]);
				szURL = DOMAIN + "indent=on&q=code:" + arrTitleCode[i] + "&wt=json";
				arrPromise.push(QueryByURL(szURL));
			}

			console.log("result : ");
			Promise.all(arrPromise).then(function(response)
			{
				for (var i = 0; i < response.length; i++)
				{
					json = JSON.parse(response[i]);
					objResult.docs.push(json["response"]["docs"][0]);
					console.log(i + " - " + json["response"]["docs"][0]["code"]);
				}

				res.write(JSON.stringify(objResult));
				res.end();
			})

		})
	}
	catch (e)
	{
		console.log(e);
	}
	
	// Query(objQuery["keyword"], "TITLE", parseInt(objQuery["p"]))
	// .then(function(response){
	// 	szResultTitle = JSON.parse(response);;
	// 	return Query(objQuery["keyword"], "URL", parseInt(objQuery["p"]));
	// })
	// .then(function(response){
	// 	szResultURL = JSON.parse(response);
	// 	return Query(objQuery["keyword"], "CONTENT", parseInt(objQuery["p"]));
	// })
	// .then(function(response){
	// 	szResultContent = JSON.parse(response);
		
	// 	objResult.docs = [];
	// 	objResult.docs = szResultContent.response.docs;

	// 	objResult.total = szResultContent.response.numFound;

	// 	console.log(objResult);
		
	// 	res.write(JSON.stringify(objResult));
	// 	res.end();
	// })
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

function QueryByURL(szQueryUrl)
{
	var szResponse = "";

	console.log(szQueryUrl);

	return new Promise(function(resolve, reject) {
   		http.get(szQueryUrl, function(response){
			response.setEncoding("utf8");
			response.on("data", function(chunk){
				szResponse += chunk;
			});

			response.on("end", function(chunk){
				//console.log(szResponse);
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
