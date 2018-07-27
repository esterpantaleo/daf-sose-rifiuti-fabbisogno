// Set global variables.
var regioni = ["ABRUZZO", "BASILICATA", "CALABRIA", "CAMPANIA", "EMILIA ROMAGNA", "LAZIO", 
               "LIGURIA", "LOMBARDIA", "MARCHE", "MOLISE", "PIEMONTE", "PUGLIA", "TOSCANA", "UMBRIA", 
               "VENETO"],
    province = ["Alessandria", "Ancona", "Arezzo", "Ascoli Piceno", "Asti", "Avellino", 
		"Bari", "Barletta-Andria-Trani", "Belluno", "Benevento", "Bergamo", "Biella", "Bologna", 
		"Brescia", "Brindisi", "Campobasso", "Caserta", "Catanzaro", "Chieti", "Como", "Cosenza", 
		"Cremona", "Crotone", "Cuneo", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena", 
		"Frosinone", "Genova", "Grosseto", "Imperia", "Isernia", "L'Aquila", "La Spezia", "Latina", 
		"Lecce", "Lecco", "Livorno", "Lodi", "Lucca", "Macerata", "Mantova", "Massa-Carrara", 
		"Matera", "Milano", "Modena", "Monza e della Brianza", "Napoli", "Novara", "Padova", 
		"Parma", "Pavia", "Perugia", "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa", "Pistoia", 
		"Potenza", "Prato", "Ravenna", "Reggio di Calabria", "Reggio nell'Emilia", "Rieti", 
		"Rimini", "Roma", "Rovigo", "Salerno", "Savona", "Siena", "Sondrio", "Taranto", "Teramo", 
		"Terni", "Torino", "Treviso", "Varese", "Venezia", "Verbano-Cusio-Ossola", "Vercelli", 
		"Verona", "Vibo Valentia", "Vicenza", "Viterbo"],
    minYear = 2010,
    maxYear = 2013, //2015,
    myType = 3,
    myValue,
    colors = ["#E50600", "#E13600", "#DD6500", "#D99200", "#D5BE00", "#BCD200", "#8CCE00", 
              "#5DCA00", "#31C600", "#06C200", "#00BF22"],
    tableData = [["Popolazione", "POPOLAZIONE", ""],
		 ["Rifiuti da raccolta differenziata sul totale rifiuti", "IND7", "%"],
		 ["Tonnellate di rifiuti raccolti e trasportati per abitante", "IND6", "t"],
		 ["Spesa storica del servizio rifiuti per abitante", "IND1", "€"],
		 ["Spesa del servizio rifiuti per tonnellate di rifiuti raccolti", "IND5", "€"]];

// Chart dimensions.
var margin = {top: 19.5, right: 100.5, bottom: 30.5, left: 100.5},
    width = 600 - margin.right,
    height = 570 - margin.top - margin.bottom;

// Initialize button color.
d3.select("#inputPiu").style("background-color", "lightblue");

function updateOnClick() {
    //update button
    d3.select("#inputPiu")
	.attr("value", "Comuni con piu' di 200000 abitanti");
    d3.select("#inputPiu")
	.style("background-color", "lightblue");
    
    //set type of drawing
    myType = 3;
    
    //clean and draw
    d3.select("#table")
	.html("");
    d3.select("#drawing")
	.remove();
    d3.select("#legend")
	.remove();
    var sel = document.getElementById('selezionaRP');
    sel.selectedIndex=0;
    
    draw(myType);
}

function updateOnSelect() {
    //update button
    d3.select("#inputPiu")
	.attr("value", "Torna a Comuni con piu' di 200000 abitanti");
    d3.select("#inputPiu")
	.style("background-color", "white");
    
    //set type of drawing and value
    var sel = document.getElementById('selezionaRP');
    myValue = sel.options[sel.selectedIndex].value;
    
    if (sel.selectedIndex > 0 && sel.selectedIndex < regioni.length + 1) {
	//it's a regione
	myType = 1;
    } else if (sel.selectedIndex > regioni.length && sel.selectedIndex < regioni.length + province.length) {
	//it's a provincia
	myType = 2;
    } 
    
    //clean and draw
    d3.select("#table")
	.html("");                
    d3.select("#drawing")
	.remove();
    d3.select("#legend")
	.remove();									
    
    draw(myType, myValue);
}

//draw graph
draw(myType, myValue);

function draw(type, value) {
    // Load the data.
    d3.json("file.json", function(comuni) {
        /*d3.json("file2015.json", function(cc) {
	
	    var comuni_years = comuni.map(c => {
		if (c.LQP_COD_5 == undefined || c.LQP_COD_6 == undefined) return c;
		var myComune = cc.filter(f => (f.COMUNE_CAT_COD == c.COMUNE_CAT_COD && c.LQP_COD_5 != undefined && c.LQP_COD_6 != undefined))
	
		if (myComune.length != 0 && myComune[0].IND1 !== undefined)
		    c.IND1.push(myComune[0].IND1[0]);
		if (myComune.length != 0 && myComune[0].IND5 !== undefined)
		    c.IND5.push(myComune[0].IND5[0]);
		if (myComune.length != 0 && myComune[0].IND7 !== undefined)
		    c.IND7.push(myComune[0].IND7[0]);
		if (myComune.length != 0 && myComune[0].LQP_COD5 !== undefined)
		    c.LQP_COD_5.push(myComune[0].LQP_COD5[0]);
		if (myComune.length != 0 && myComune[0].LQP_COD6 !== undefined)
		    c.LQP_COD_6.push(myComune[0].LQP_COD6[0]);
//		console.log(c)
		return c;
	    });
	    console.log(JSON.stringify(comuni_years))
	*/
            // Various scales. These domains make assumptions of data, naturally.
            var xScale = d3.scale.linear().domain([0, 10]).range([- 20, width]), //.clamp(true),
		yScale = d3.scale.linear().domain([0, 10]).range([height + 20, 40]),
		radiusScale = d3.scale.sqrt().domain([0, 1000000]).range([2, 50]).clamp(true),
		heatmapColor = d3.scale.linear().domain(d3.range(0, 1, 1.0 / (colors.length - 1))).range(colors),
		colorScale = d3.scale.linear().domain([1,10]).range([0,1]);
	    
            // The x & y axes.
            var xAxis = d3.svg.axis().orient("bottom").scale(xScale).tickSize(0).tickValues([1,2,3,4,5,6,7,8,9,10]).tickFormat(d3.format("g")),
		yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(0).tickValues([1,2,3,4,5,6,7,8,9,10]).tickFormat(d3.format("g"));
	    
            // Create the SVG container and set the origin.
            var svg = d3.select("#chart").append("svg")
		.attr("id", "drawing")
		.attr("width", width + margin.left + margin.right + 10)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	    
            // Add the x and y axes + labels.
            svg.append("g")
		.attr("class", "x axis")
		.call(xAxis)
		.attr("transform", "translate(0," + height + ")");
	    
            svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);
	    
            svg.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "middle")
		.attr("x", width - 200)
		.attr("y", height + 27)
		.text("Efficienza nella gestione della spesa")
		.style("font-size", "1em");
	    
            svg.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "middle")
		.attr("y", - 30)
		.attr("x", - 150)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.text("Livello dei servizi erogati")
		.style("font-size", "1em");
	    
            //add the year label
            var label = svg.append("text")
		.attr("class", "year label")
		.attr("text-anchor", "end")
		.attr("y", 90)
		.attr("x", width/1.8)
		.text(minYear);
	    
            var select = document.getElementById("selezionaRP");
            regioni.concat(province).forEach(function(d) {
		var el = document.createElement("option");
		el.textContent = d;
		el.value = d;
		select.appendChild(el);
            });
	    
            function order(a, b) {
		return b.POPOLAZIONE - a.POPOLAZIONE;
            }
	    
            // A bisector since man data is sparsely-defined. 
            var bisect = d3.bisector(function(d) { return d[0]; });
	    
            var circle = svg.append("g")
		.attr("class", "myg")
		.selectAll("dots")
		.data(interpolateData(minYear))
		.enter();

	    
            var dot = circle.append("circle")  
		.attr("class", "dot") 
		.call(position)
		.sort(order)
		.on("click", function(d) {
                    var clickedComune = comuni.filter(function(c) { return d.COMUNE === c.COMUNE; })[0];
		    renderTable(clickedComune);
		}); 
            
            // Add a title. 
            dot.append("title")     
		.text(function(d) { return "Comune di " + d.COMUNE; });
	    
            var random = dot[0].map(function(d) { return Math.random(); });
            var sign = dot[0].map(function(d) { return Math.random() > 0.5 ? 1 : -1; });
	    
            var dotText = circle.append("svg:text")
		.text(function(d) { return d.COMUNE; })
		.call(positionText);
	    
            // Add an overlay for the year label.
            var box = label.node().getBBox(); 
	    
            var overlay = svg.append("rect") 
		.attr("class", "overlay")
		.attr("x", box.x)
		.attr("y", box.y)
		.attr("width", box.width) 
		.attr("height", box.height)
		.on("mouseover", enableInteraction);
	    
            // Start a transition that interpolates the data based on year.
            svg.transition()
		.duration(1000)
		.ease("linear")
		.tween("year", tweenYear)
		.each("end", enableInteraction);

	if (type === 1) {
	    renderTable(comuni.filter(function(c) { return c.REGIONE_DENOMINAZIONE === value; }).sort(function(a, c) { return a.POPOLAZIONE[0][1] < c.POPOLAZIONE[0][1]; })[0]);
	} else if (type === 2) {
	    renderTable(comuni.filter(function(c) { return c.PROVINCIA_DES === value; }).sort(function(a, c) { return a.POPOLAZIONE[0][1] < c.POPOLAZIONE[0][1]; })[0]);
	} else if (type === 3) {
	    renderTable(comuni.filter(function(c) { return "Milano" === c.COMUNE; })[0]);
        }
	
	// render table
	function renderTable(comune) {
	    var myTable = "<p><h2 class=\"header\"> Comune di " + comune.COMUNE + "</h2>" +
                "<table style=\"width:100%\">" +
		"<th><td class=\"year\">2010</span></td><td class=\"year\">2013</span></td></th>" +
                tableData.map(function(d) {
		    if (comune[d[1]][1] === undefined ) {console.log(d[1]); console.log(comune[d[1]]);console.log(comune); console.log(tableData);}
                    var t2010 = comune[d[1]][0][1];
                    if (undefined !== t2010) {
                        t2010 = (t2010 < 1) ? Math.round(t2010 * 100) / 100 : Math.round(t2010);
                    } else {
                        t2010 = "-";
                    }
                    var t2013 = comune[d[1]][1][1];
                    if (undefined !== t2013) {
                        t2013 = (t2013 < 1) ? Math.round(t2013 * 100) / 100: Math.round(t2013);
                    } else {
                        t2013 = "-";
                    }
                    var symbol = d[2];
                    var arrow = "";
                    if (undefined !== t2010 && undefined !== t2013) {
                        if (t2013 > t2010) {
                            arrow = "<span class=\"arrow green\">&uarr;</span>";
                                } else if (t2013 === t2010) {
                                    arrow = "=";
                                } else {
                                    arrow = "<span class=\"arrow red\">&darr;</span>";
				}
                    }
                    return "</table><table style=\"width:100%\">" +
                        "<th width=\"100%\" class=\"header\" colspan=\"3\">" +
			d[0] +
                        "</th>" +
                        "<tr class=\"data\"> <td class=\"data\" width=\"45%\" class=\"data\">" +
                        t2010 +
                        " " + symbol +
                        "</td><td width=\"10%\" class=\"data\">" +
	                arrow +
                        "</td><td width=\"45%\" class=\"data\">" +
			t2013 +
                        " " + symbol +
                        "</td></tr>" +
                                "</table>";
                }).join(" ") +
                "</p>";
            d3.select("#table").html(myTable);
	}
            // Positions the dots based on data.
            function position(dot) {
		dot.attr("cx", function(d) { return xScale(11 - d.LQP_COD_5); }) 
                    .attr("cy", function(d) { return yScale(d.LQP_COD_6); }) 
                    .attr("r", function(d) { return radiusScale(d.POPOLAZIONE); })
                    .style("fill", function(d) { return heatmapColor(colorScale(((11 - d.LQP_COD_5) + d.LQP_COD_6)/2)); })
                    .attr("opacity", function(d) { return (isNaN(d.LQP_COD_6) || isNaN(d.LQP_COD_5)) ? 0 : 1});
            }
	    
            function positionText(dotText) {
		dotText.attr("x", function(d, i) { return xScale(11-d.LQP_COD_5) + random[i] * radiusScale(d.POPOLAZIONE) + 5; })
		    .attr("y", function(d, i) { return yScale(d.LQP_COD_6) - sign[i] * Math.sqrt(1 - random[i] * random[i]) * radiusScale(d.POPOLAZIONE) - 5; })
		    .attr("opacity", function(d) { return (isNaN(d.LQP_COD_6) || isNaN(d.LQP_COD_5)) ? 0 : 1});
            }
	    
            // After the transition finishes, you can mouseover to chane the year. 
            function enableInteraction() {  
            var yearScale = d3.scale.linear()
                .domain([minYear, maxYear])  
                .range([box.x + 10, box.x + box.width - 10])   
                .clamp(true);  
		
		// Cancel the current transition, if any. 
		svg.transition().duration(0);
		
		overlay.on("mouseover", mouseover)  
                    .on("mouseout", mouseout)
                    .on("mousemove", mousemove) 
                    .on("touchmove", mousemove); 
		
		function mouseover() { 
                    label.classed("active", true);
		}
		
		function mouseout() { 
                    label.classed("active", false);
		}
		
		function mousemove() {  
                    displayYear(yearScale.invert(d3.mouse(this)[0]));
		}
            }
	    
            // Tweens the entire chart by first tweening the year, and then the data.
            // For the interpolated data, the dots and label are redrawn.   
            function tweenYear() {
		var year = d3.interpolateNumber(minYear, maxYear);
		
		return function(t) { displayYear(year(t)); }; 
            }
	    
            function key(d) { return d.COMUNE; }
	    
            // Updates the display to show the specified year.
            function displayYear(year) {
		var data = interpolateData(year);
		dot.data(data, key).call(position).sort(order);
		dotText.data(data, key).call(positionText);
		label.text(Math.round(year));
            }
	    
            // Interpolates the dataset for the given (fractional) year.
            function interpolatePart(year) {
		return comuni.map(function(d) {
                    return {
			COMUNE: d.COMUNE,
			POPOLAZIONE: interpolateValues(d.POPOLAZIONE, year),
			LQP_COD_5: interpolateValues(d.LQP_COD_5, year),
			LQP_COD_6: interpolateValues(d.LQP_COD_6, year),
			PROVINCIA_DES: d.PROVINCIA_DES,
			REGIONE_DENOMINAZIONE: d.REGIONE_DENOMINAZIONE,
			IND1: interpolateValues(d.IND1, year),
			IND5: interpolateValues(d.IND5, year),
			IND6: interpolateValues(d.IND6, year),
			IND7: interpolateValues(d.IND7, year)
                    };
		});
            }
	    
            function interpolateData(year) {
		if (type === 1) {
                    return interpolatePart(year).filter(function(d) {
			return (d.REGIONE_DENOMINAZIONE === value && d.POPOLAZIONE > 30000);
		    });
		}
		if (type === 2) {
                    return interpolatePart(year).filter(function(d) {
			return (d.PROVINCIA_DES === value && d.POPOLAZIONE > 5000);
		    });
		}
		if (type === 3) {
		    return interpolatePart(year).filter(function(d) {
			return (d.POPOLAZIONE > 200000);
		    });
		}
            }
	    
            // Finds (and possibly interpolates) the value for the specified year.
            function interpolateValues(values, year) {
		if (values != undefined && !(year > 2013 && values.length === 3 && values[2][2] === NaN) && !(year > 2013 && values.length === 2)) {
                    var i = bisect.left(values, year, 0, values.length - 1),
			a = values[i];
                    if (i > 0) {
			var b = values[i - 1],
                            t = (year - a[0]) / (b[0] - a[0]);
			return a[1] * (1 - t) + b[1] * t;
                    }
                    return a[1];
		} else {
                    return NaN;
		}
            }
	    
	    // Add the radius legend
            var radiusLegend = d3.select("#radiusLegend")
		.append("div")
		.attr("id", "legend")
		.append("svg")
		.attr("width", width)
		.attr("height", height/5)
		.attr("transform", "translate(" + margin.left + "," +  margin.top + ")");
	    
            radiusLegend.append("text")
		.attr("text-anchor", "start")
		.attr("x", 0)
		.attr("y", 2.9 * height / 30)
		.text("Popolazione")
		.style("font-size", "1em");
	    
            radiusLegend.append("text")
		.attr("text-anchor", "start")
		.attr("x", 8 * width / 30)
		.attr("y", 2.9 * height / 30)
		.text("1000")
		.style("font-size", "1em");
	    
	    radiusLegend.append("circle")
		.attr("class", "dot")
		.attr("fill", "white")
		.attr("cx", 9 * width / 30)
		.attr("cy", height / 30)
		.attr("r", radiusScale(1000));
	    
            radiusLegend.append("text")
		.attr("text-anchor", "start")
		.attr("x", 11 * width / 30)
		.attr("y", 2.9 * height / 30)
		.text("10000")
		.style("font-size", "1em");
	    
            radiusLegend.append("circle")
		.attr("class", "dot") 
		.attr("fill", "white")
		.attr("cx", 12.5 * width / 30)
		.attr("cy", height / 30)
		.attr("r", radiusScale(10000));
	    
            radiusLegend.append("text")
		.attr("text-anchor", "start")
		.attr("x", 15.3 * width / 30)
		.attr("y", 2.9 * height / 30)
		.text("100000")
		.style("font-size", "1em");
	    
            radiusLegend.append("circle")
		.attr("class", "dot") 
		.attr("fill", "white")
		.attr("cx", 17 * width / 30)
		.attr("cy", height / 30)
		.attr("r", radiusScale(100000));
	//});	
    });
}
