$( document ).ready(function()
{
	var MAX_SHOW_PAGE = 5;
	var MAX_RESULT_SHOW = 10;
	var m_iCurrent = 1;							//Current page;

	$(".page-manager").hide();
	$(".line").hide();

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
		$(".collapse").show();
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

	$("#search-btn").click(function(){
		var szTextSearch = $("#text-search").val();
		m_iCurrent = 1;
		Search(szTextSearch, 1);
	});

	function Search(szKeyword, szPage)
	{
		var szQueryUrl = "";
		if (szKeyword === "")
		{
			return;
		}

		szQueryUrl = "http://localhost:9999/search?keyword=" + szKeyword + "&p=" + szPage;
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
	    
	    reg = new RegExp(szKeywordSearch, "img");

	    $(".result").text("");
	    for (var i = 0; i < objDoc.length; i++)
	    {
	    	// objResult[i]["content"][0] = objResult[i]["content"][0].replace(reg, '<b>' + szSearchText +'</b>');
	    	szHtml += '<div class="single-result">';
	    	szHtml += '<div class="title"><a href = "' + objDoc[i]["url"] + '" target = "_blank">' + objDoc[i]["title"] + '</a></div>';
	    	szHtml += '<div class="url">' + objDoc[i]["url"] + '</div>';
	    	szHtml += '<div class="content">' + objDoc[i]["content"][0] + "</div>";
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
	    var iMaxpage = Math.round(objResult.total / MAX_RESULT_SHOW) + 1;

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
});