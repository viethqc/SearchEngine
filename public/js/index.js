$( document ).ready(function()
{
	var MAX_SHOW_PAGE = 5;
	var MAX_RESULT_SHOW = 10;
	var m_iCurrent = 1;							//Current page;
	var m_bAdvanceSearch = false;

	Init();

	window.onhashchange = function() {
	 var  i = 0;
 		i++;
	}

	// Vanilla javascript
	window.addEventListener('popstate', function (e) {
	    var state = e.state;
	        Init();
	});

    $('#text-search').on('input', function() { 
	    $(".icon").hide();
	    $(".search").css("padding-top", "30px");
	    $(".line").show();
	    $(".result").show();
	    $(".search-button-icon").show();
		$(".advance-search").show();
		$("#search-btn").hide();
	});

	$(".advance-search").click(function(){
		m_bAdvanceSearch = !m_bAdvanceSearch;

		if (m_bAdvanceSearch == true)
		{
			$(".collapse").show();
		}
		else
		{
			$(".collapse").hide();
			$("#date-start").val("");
			$("#date-end").val("");
			$("#drop-word").val("");
			$("#any-word").val("");
			$("#match-search").val("");
		}
	});

	$('#text-search').keypress(function (e) {
	 	var keyCode = (event.keyCode ? event.keyCode : event.which);   
	 	if(keyCode == 13)  // the enter key code
	  	{
	  		var szTextSearch = $("#text-search").val();
	  		m_iCurrent = 1;
		    Search(szTextSearch, 1);
	  	}
	});

	$(".search-button-icon").click(function(){
		var szTextSearch = $("#text-search").val();
		m_iCurrent = 1;

		Search(szTextSearch, 1);
	});

	$("#search-btn").click(function(){
		var szTextSearch = $("#text-search").val();

		if (m_bAdvanceSearch == true)
		{
			$("#search-all").val(szTextSearch);
		}

		m_iCurrent = 1;
		Search(szTextSearch, 1);
	});

	function Search(szKeyword, szPage)
	{
		var szQueryUrl = "";
		var szType = "";

		var arrPart = $("#search-all").val().split(" ");
		var szSearchAll = "";
		var szAnyWord = "";
		for (var i = 0; i < arrPart.length; i++)
		{
			if (arrPart[i] === "")
			{
				continue;
			}

			if (i != 0)
			{
				szSearchAll += " ";
			}

			szSearchAll += arrPart[i];
		}

		arrPart = $("#any-word").val().split(" ");
		var szAnyWord = "";
		for (var i = 0; i < arrPart.length; i++)
		{
			if (arrPart[i] === "")
			{
				continue;
			}

			if (i != 0)
			{
				szAnyWord += "+";
			}

			szAnyWord += arrPart[i];
		}

		szQueryUrl = "http://localhost:9999/searchapi?keyword=" + szKeyword + "&p=" + szPage + "&match=" + $("#match-search").val() + 
					"&datestart=" + $("#date-start").val() + "&dateend=" + $("#date-end").val() + "&dropword=" + $("#drop-word").val() +
					"&any-word=" + szAnyWord + "&search-all=" + szSearchAll;
		var obj = "/search?keyword=" + szKeyword + "&p=" + szPage + "&match=" + $("#match-search").val() + 
					"&datestart=" + $("#date-start").val() + "&dateend=" + $("#date-end").val() + "&dropword=" + $("#drop-word").val() +
					"&any-word=" + szAnyWord + "&search-all=" + szSearchAll;

		var szTmp = "http://localhost:9999/search?keyword=" + szKeyword + "&p=" + szPage + "&match=" + $("#match-search").val() + 
					"&datestart=" + $("#date-start").val() + "&dateend=" + $("#date-end").val() + "&dropword=" + $("#drop-word").val() +
					"&any-word=" + szAnyWord + "&search-all=" + szSearchAll;
		if (szTmp != decodeURIComponent(document.URL))
		{
			window.history.pushState("hello", "Search Engine", obj);
		}

		$.ajax({
		    url: szQueryUrl,
		    crossDomain: true,
		    dataType:'json',
		}).done(function(data) {
		    ShowResult(data, $("#text-search").val());
		});
	}

	$(".prev").click(function(){
		var iCurrentActive = -9;
		m_iCurrent--;

		var szTextSearch = $("#text-search").val();
    	Search(szTextSearch, m_iCurrent);
	});

	$(".next").click(function(){
		var iCurrentActive = -9;
		m_iCurrent++;

		var szTextSearch = $("#text-search").val();
		Search(szTextSearch, m_iCurrent);
	})

	$(".page").click(function(){
		var szTextSearch = $("#text-search").val();

		m_iCurrent = $(this).text();
		Search(szTextSearch, $(this).text());

		$(".page").each(function(iIndex){
			if ($(this).hasClass("active") === true)
			{
				$(this).removeClass("active");
			}
		});

		$(this).addClass("active");
	});

	function RedrawPageManager(iCurrentPage)
	{

	}

	function ShowResult(objResult, szSearchText)
	{
		var szHtml = "";
	    var szKeywordSearch = szSearchText;
	    var reg = null;
	    var szRegText = "";

	    var objDoc = objResult.docs;

	    if (objDoc.length == 0)
	    {
	    	$(".result").html(" Không tìm thấy <b>" + szSearchText +"</b> trong tài liệu nào<br>" 		+ 
	    						"Ðề xuất:"																+															
								"<ul>"																	+
									"<li>Xin bạn chắc chắn rằng tất cả các từ đều đúng chính tả.</li>"	+	
									"<li>Hãy thử những từ khóa khác.</li>"								+								
									"<li>Hãy thử những từ khóa chung hơn.</li>"							+
									"<li>Hãy thử bớt từ khóa.</li>"										+									
								"</ul>");
	    	$(".page-manager").hide();
	    	return;
	    }

	    $(".result").text("");
	    for (var i = 0; i < objDoc.length; i++)
	    {
	    	objDoc[i]["date"] = objDoc[i]["date"].replace(/[T]/g, " ");
	    	objDoc[i]["date"] = objDoc[i]["date"].replace(/[Z]/g, " ");
	    	// objResult[i]["content"][0] = objResult[i]["content"][0].replace(reg, '<b>' + szSearchText +'</b>');
	    	szHtml += '<div class="single-result">';
	    	szHtml += '<div class="title"><a href = "' + objDoc[i]["url"] + '" target = "_blank">' + objDoc[i]["title"] + '</a></div>';
	    	szHtml += '<div class="url">' + objDoc[i]["url"] + '</div>';
	    	szHtml += '<div class="date"> Date : ' + objDoc[i]["date"] + '</div>';

	    	if (objDoc[i].hasOwnProperty("content") === true)
	    	{
	    		szHtml += '<div class="content">' + HighLight(objDoc[i]["content"][0], szSearchText) + "</div>";
	    	}
	    	else
	    		szHtml += '<div class="content">' + "</div>";
	    	szHtml += '</div>';
	    }

	    $(".result").html(szHtml);

	    //Hien thi phan phan trang
	    $(".page-manager").show();
	    iPageStart = Math.floor((m_iCurrent - 1) / MAX_SHOW_PAGE) * MAX_SHOW_PAGE;
	    if (objResult.total - (m_iCurrent - 1) > MAX_SHOW_PAGE)
	    {
	    	iPageEnd = iPageStart + MAX_SHOW_PAGE;
	    }
	    else
	    {
	    	iPageEnd = objResult.total;
	    }

	    var i = iPageStart;
	    var iMaxpage = Math.round(objResult.total / MAX_RESULT_SHOW);

		$(".page a").each(function(index){
			$(this).text(i + 1);

			if (iMaxpage < (i + 1))
			{
				$(this).parent().hide();
			}
			else
			{
				$(this).parent().show();
			}

			if (m_iCurrent == (i + 1))
			{
				$(this).parent().addClass("active");
			}
			else
			{
				$(this).parent().removeClass("active");
			}

			i++;
		});

		//An nut prev neu trang hien tai la 1
		if (m_iCurrent == 1)
		{
			$(".prev").hide();
		}
		else
		{
			$(".prev").show();	
		}

		//An nut next neu trang hien tai la trang cuoi cung
		if (m_iCurrent == iMaxpage)
		{
			$(".next").hide();
		}
		else
		{
			$(".next").show();	
		}
	}

	var getLocation = function(href) {
	    var l = document.createElement("a");
	    l.href = href;
	    return l;
	};

	function HighLight(strDocument, strKeyword)
	{
		var arrParts = [];
		var arrPartDoc = [];
		var strDocAfferHighLight;
		var arrPartDocAfferHighLight = [];
		var strResult;

		//Tim tung phan cua tu tim kiem
		arrParts = strKeyword.split(" ");
		arrPartDoc  = strDocument.split(".");
		var arrRank = [];
		var iCount = 0;
		var objRank = {};
		var arrObj = [];

		//Tim tan suat xuat hien cua tu trong tung cau
		for (var i = 0; i < arrPartDoc.length; i++)
		{
			iCount = 0;
			arrPartDoc[i] = arrPartDoc[i].toLowerCase();
			for (var j = 0; j < arrParts.length; j++)
			{
				arrParts[j] = arrParts[j].toLowerCase();
				if (arrPartDoc[i].indexOf(arrParts[j]) == -1)
				{
					continue;
				}
				iCount++;
			}
			arrRank[i] = iCount;
		}

		//Day thong tin xep hang vao mang object
		for (var i = 0; i < arrRank.length; i++)
		{
			arrObj.push({id : i, rank : arrRank[i]});
		}

		//Sap xep mang object theo rank
		arrObj.sort(function(a, b){
			return b.rank - a.rank;
		});

		strDocAfferHighLight = HighLightSentence(strDocument, strKeyword);
		arrPartDocAfferHighLight = strDocAfferHighLight.split(".");

		strResult = "";
		for (var i = 0; i < arrObj.length; i++)
		{
			strResult += arrPartDocAfferHighLight[arrObj[i].id];
			if (strResult.length > 200)
			{
				break;
			}
		}

		for (var i = 0; i < arrParts.length; i++)
		{

		}

		return strResult;
	}

	function HighLightSentence(strSentence, strKeyword)
	{
		var arrPart = [];
		var arrParts = [];
		var uniqueKeyword = [];
		var strKey;
		var iIndex;
		var strNewSentence;
		var strLowerCaseSentence;
		var arr = [];

		strLowerCaseSentence = strSentence.toLowerCase();
		//Xoa duplicate trong keyword
		strKeyword = strKeyword.toLowerCase();
		arrPart = strKeyword.split(" ");
		for (var i = 0; i < arrPart.length; i++)
		{
			if(uniqueKeyword.indexOf(arrPart[i]) == -1)
			{
				uniqueKeyword.push(arrPart[i]);
			}
		}

		for (var i = 0; i < arrPart.length; i++)
		{
			if (arrPart[i] === "")
			{
				continue;
			}
			arrParts.push(arrPart[i]);
		}

		strKey = uniqueKeyword[0];
		strNewSentence = "";
		var strTmp = strLowerCaseSentence;
		for (var i = 0; i < arrParts.length; i++)
		{
			var regex = new RegExp(arrParts[i], "gi"), result, indices = [], origin = [];
			while ( (result = regex.exec(strTmp)) ) {
			    indices.push(result.index);
			}

			while ( (result = regex.exec(strLowerCaseSentence)) ) {
			    origin.push(result.index);
			}

			iIndex = 0;
			strNewSentence = "";
			for (var j = 0; j < indices.length; j++)
			{
				strNewSentence += strTmp.substring(iIndex, indices[j]);
				strNewSentence += "<b>";
				strNewSentence += strSentence.substring(origin[j], origin[j] + arrPart[i].length);
				strNewSentence += "</b>";
				iIndex = indices[j] + arrPart[i].length;
			}
			strNewSentence += strTmp.substring(indices[indices.length - 1] + arrPart[i].length);
			strTmp = strNewSentence;
		}

		return strTmp;
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

	function getParameterByName(name, url)
	{
	    if (!url)
	    {
	      	url = window.location.href;
	    }
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	     results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}	

	function Init()
	{
		var szUrl = document.URL;

		if (szUrl.indexOf("/search") === -1)
		{
			$("#search-btn").show();
			$(".line").hide();
			$(".result").text("");
			$(".result").hide();
			$(".advance-search").hide();
			$(".page-manager").hide();
			$(".icon").show();
			$("#text-search").val("");
			$(".collapse").hide();

			return;
		}
		var szKeyword = getParameterByName("keyword", document.url);
		var szPage = getParameterByName("p", document.url);
		var szMatch = getParameterByName("match", document.url);
		var szDateStart = getParameterByName("datestart", document.url);
		var szDateEnd = getParameterByName("dateend", document.url);
		var szDropword = getParameterByName("dropword", document.url);
		var szAnyWord = getParameterByName("any-word", document.url);
		var szSearchAll = getParameterByName("search-all", document.url);

		if (szMatch !== "" || szDateStart !== "" || szDateEnd !== "" || szDropword !== "" || szAnyWord !== "" || szSearchAll !== "")
		{
			m_bAdvanceSearch = true;
		}

		if (szUrl.indexOf("search") != -1)
		{
			$(".icon").hide();
		    $(".search").css("padding-top", "30px");
		    $(".line").show();
		    $(".result").show();
		    $(".search-button-icon").show();
			$(".advance-search").show();
			$("#search-btn").hide();
		}

		if (m_bAdvanceSearch == true)
		{
			$(".collapse").show();
		}
		else
		{
			$(".collapse").hide();
			$("#date-start").val("");
			$("#date-end").val("");
			$("#drop-word").val("");
			$("#any-word").val("");
			$("#match-search").val("");
		}

		var obj = "/search?keyword=" + szKeyword + "&p=" + szPage + "&match=" + $("#match-search").val() + 
					"&datestart=" + $("#date-start").val() + "&dateend=" + $("#date-end").val() + "&dropword=" + $("#drop-word").val() +
					"&any-word=" + szAnyWord + "&search-all=" + szSearchAll;

		$("#text-search").val(szKeyword);
		$("#match-search").val(szMatch);
		$("#date-start").val(szDateStart);
		$("#date-end").val(szDateEnd);
		$("#drop-word").val(szDropword);
		$("#any-word").val(szAnyWord);
		$("#search-all").val(szSearchAll);

		m_iCurrent = parseInt(szPage);
		Search(szKeyword, m_iCurrent);

		return;
	}
});