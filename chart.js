$(document).ready(function () {
	var graphList = [];
	var row;
	
	if (!document.getElementById('graph-canvas')) {
		return;
	}
	
	$("#graph-raw-list li").each(function (i) {
		$(this).append("<span>" + ($("#graph-raw-list li").length - i - 1) + "</span>")
	})
	
	$("#graph-raw-list li span.node-relation").each(function () {
		row = $.trim($(this).text().replace(/\s+/g, " ")).split("");
		
		graphList.unshift(row.concat());
	})
	
	gitGraph(document.getElementById('graph-canvas'), graphList)
})
