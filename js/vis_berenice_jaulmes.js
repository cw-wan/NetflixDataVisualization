const CTX_BRE = {
    SVG_W: 1120,
    SVG_H: 500,
    GREY_NULL: "#DFDFDF"
};

function getListCountries(countries) {
    res = countries.split(",");
    res_def = []
    res.forEach(
        function (country) {
            country = country.replace('[', '');
            country = country.replace(']', '');
            country = country.replace(' ', '');
            country = country.replaceAll("'", '');
            res_def.push(country)
        }
    );
    return res_def;
}

function get_clean_codes() {
    let num = {};
    let name = {};
    CTX_BRE.country_code_eq.forEach(
        function (codes) {
            temp = codes["Numeric code"]
            while (temp.length < 3) {
                temp = "0" + temp;
            }
            num[temp] = codes["Alpha-2 code"];
            name[codes["Numeric code"]] = codes["English short name lower case"];
        }
    );
    return [num, name];
}

function getMinMaxB() {
    let min = 100000;
    let max = 0;
    for (var key in CTX_BRE.dict) {
        if (CTX_BRE.dict[key] < min) {
            min = CTX_BRE.dict[key];
        }
        if (CTX_BRE.dict[key] > max) {
            max = CTX_BRE.dict[key];
        }
    }
    return [max, min];
}

function getPercentileB(data, percentile) {
    data.sort((a, b) => a - b);
    let index = Math.ceil((percentile / 100) * (data.length - 1));
    return data[index];
}

function buildMapBN() {
    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath().projection(projection);
    const countries = topojson.feature(CTX_BRE.worldmapdata, CTX_BRE.worldmapdata.objects.countries);
    let gmap = CTX_BRE.svgEl.append("g").attr("id", "gmap");
    gmap.attr("width", CTX_BRE.SVG_W - 300)
    let minMax = getMinMaxB();
    CTX_BRE.maxMovies = minMax[0];
    CTX_BRE.minMovies = minMax[1];
    let clean_codes = get_clean_codes(CTX_BRE.country_code_eq);
    CTX_BRE.list_country_code = clean_codes[0];
    CTX_BRE.list_country_name = clean_codes[1];
    let cnts = countries.features.map(d => (parseInt(CTX_BRE.dict[CTX_BRE.list_country_code[d.id]])));
    cnts = cnts.filter(d=>(!isNaN(d)));
    let contrast = d3.scaleLinear()
        .domain([d3.min(cnts), getPercentileB(cnts, 25), d3.median(cnts), getPercentileB(cnts, 75), d3.max(cnts)])
        .range([0, 0.25, 0.5, 0.75, 1]);
    let colorScale = d3.scaleSequential(d3.interpolateBlues);
    gmap.append("path")
        .attr("class", "sphere")
        .attr("d", path({type: 'Sphere'}))
        .style("fill", "white")
        .style("stroke", "darkgray");
    gmap.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .style("fill", function (d) {
            let val = CTX_BRE.dict[CTX_BRE.list_country_code[d.id]];
            if (val == null) {
                return CTX_BRE.GREY_NULL;
            } else {
                return colorScale(contrast(val));
            }
        })
        .style('stroke', 'darkgray')
        .on("mouseover", function () {
            d3.selectAll(".country")
                .transition()
                .duration(200)
                .style("opacity", 0.5);
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black");
        })
        .on("mouseleave", function () {
            d3.selectAll(".country")
                .transition()
                .duration(200)
                .style("opacity", 1)
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "transparent")
        })
        .append("title")
        .text(function (d) {
            return CTX_BRE.list_country_name[d.id] + "\n" + CTX_BRE.dict[CTX_BRE.list_country_code[d.id]] + " movies";
        });

    var glegend = CTX_BRE.svgEl.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(970,230) rotate(-90)`);

    // Define the gradient
    let defs = glegend.append("defs");
    let linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient-world");

    const n = 10; // Number of gradient stops
    for (let i = 0; i <= n; i++) {
        linearGradient.append("stop")
            .attr("offset", `${i / n * 100}%`)
            .attr("stop-color", colorScale(i / n));
    }

    glegend.append("rect")
        .attr("height", 20)
        .attr("width", 200)
        .attr("x", 0)
        .attr("y", 5)
        .style("fill", "url(#linear-gradient-world)");

    let legendX = d3.scaleLinear()
        .domain([0, getPercentileB(cnts, 25), d3.median(cnts), getPercentileB(cnts, 75), d3.max(cnts)])
        .range([0, 50, 100, 150, 200]);

    glegend.append("g")
        .attr("id", "world-legend-x-axis")
        .attr("transform", "translate(0, 25)")
        .call(d3.axisBottom(legendX).ticks(4).tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("transform", "translate(13, 20) rotate(90)");
    glegend.append("rect")
        .attr("height", 20)
        .attr("width", 20)
        .attr("transform", "translate(-60 ,5)")
        .attr("fill", "lightgrey");
    glegend.append("text")
        .text("No data")
        .style("font-size", "12px")
        .attr("height", 20)
        .attr("width", 20)
        .attr("transform", "translate(-35 ,0) rotate(90)");
    glegend.append("text")
        .text("Number of Shows/Movies")
        .style("font-size", "12px")
        .attr("transform", "translate(205 ,0) rotate(90)");

}

function loadDataBren() {
    Promise.all([
        d3.csv("data/titles.csv"),
        d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json"),
        d3.csv("data/country-codes.csv")
    ])
        .then(function (d) {
            CTX_BRE.titles = d[0].filter(d => d.type === "MOVIE");
            CTX_BRE.worldmapdata = d[1];
            CTX_BRE.country_code_eq = d[2];
            let moviesByCountry = d3.group(CTX_BRE.titles, (e) => (e.production_countries));
            CTX_BRE.dict = {}; // contains the number of movies per country
            moviesByCountry.forEach(function (e, c) {
                let countries = getListCountries(c);
                countries.forEach(function (x) {
                    if (x in CTX_BRE.dict) {
                        CTX_BRE.dict[x] += e.length;
                    } else {
                        if (x === "['Lebanon']") {
                            CTX_BRE.dict["['LB']"] += e.length;
                        } else {
                            CTX_BRE.dict[x] = e.length;
                        }
                    }
                });
            });
            console.log(CTX_BRE.titles);
            buildMapBN();
        });
}

function createVizBer() {
    CTX_BRE.svgEl = d3.select("#worldMap").append("svg");
    CTX_BRE.svgEl.attr("width", CTX_BRE.SVG_W);
    CTX_BRE.svgEl.attr("height", CTX_BRE.SVG_H);
    loadDataBren();
}