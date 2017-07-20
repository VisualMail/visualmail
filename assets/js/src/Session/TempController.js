$(document).ready(function() { 
    var svgMapa = d3.select("#main").append("svg").attr("style", "background-color: #fff;"); 
    for(var i = 0; i < 10; i++) {
        var sessionCircle = svgMapa.append("circle")
		.attr("stroke", "black")
		.attr("stroke-width", "1")
		.attr("cx", 80 + (i * 100))
		.attr("cy", 23)
		.attr("r", 22)
		.attr("class", "tooltipped")
		.attr("data-position", "left")
        .attr("data-delay", "50");
    }

    var m = $(".svg-map"); 

	m.find("svg")
		.attr("height", 200)
		.attr("width", 1600); 
	//m.attr("style", "heigth: " + 100 + "px; width: " + 800  + "px;"); 
}); 