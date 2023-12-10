const ctx = {
    w: 650, h: 440,
    margin: {top: 60, right: 30, bottom: 20, left: 110},
    legend: {h: 60}
}

function createViz() {
    let svgEl = d3.select("#genreImdb").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    let rootG = svgEl.append("g").attr("id", "rootG").attr("transform",
        "translate(" + ctx.margin.left + "," + ctx.margin.top + ")");
    loadData(rootG);
}

function loadData(rootG) {
    Promise.all([d3.csv("data/titles.csv"), d3.csv("data/credits.csv")]).then((data) => {
        let shows = data[0];
        let genreImdb = {};
        shows.forEach((d) => {
            if (d["imdb_score"] !== "") {
                let genres = JSON.parse(d["genres"].replace(/'/g, '\"'));
                for (let genre of genres) {
                    if (genreImdb[genre] === undefined) {
                        genreImdb[genre] = [parseFloat(d["imdb_score"]),];
                    } else {
                        genreImdb[genre].push(parseFloat(d["imdb_score"]));
                    }
                }
            }
        });
        plotGenreImdbDistribution(rootG, genreImdb);
    });
}

function plotGenreImdbDistribution(rootG, data) {
    let x = d3.scaleLinear()
        .domain([0, 10.0])
        .range([0, ctx.w - ctx.margin.left - ctx.margin.right]);
    let height = ctx.h - ctx.margin.bottom - ctx.margin.top - ctx.legend.h;
    rootG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10));

    let kde = kernelDensityEstimator(kernelEpanechnikov(0.2), x.ticks(40));
    let allDensity = [];
    let allAvg = [];
    let maxAllDensity = 0;
    for (let genre of Object.keys(data)) {
        let density = kde(data[genre].map(d => d));
        let maxDensity = d3.max(density, (d) => (d[1]));
        let avgScore = d3.mean(data[genre]);
        allAvg.push(avgScore);
        if (maxDensity > maxAllDensity) {
            maxAllDensity = maxDensity;
        }
        allDensity.push({key: genre, density: density, avg: avgScore});
    }

    allDensity.sort(function (x, y) {
        return d3.descending(x.avg, y.avg);
    });

    let yGenre = d3.scaleBand()
        .domain(allDensity.map(d => d.key))
        .range([0, ctx.h - ctx.margin.top - ctx.margin.bottom - ctx.legend.h])
        .paddingInner(1);
    rootG.append("g")
        .call(d3.axisLeft(yGenre));

    let densityScale = d3.scaleLinear()
        .domain([0, maxAllDensity])
        .range([0, -60]);

    // color scale
    let contrast = d3.scaleLinear()
        .domain([d3.min(allAvg), d3.median(allAvg), d3.max(allAvg)])
        .range([0, 0.5, 1]);
    let colorScale = d3.scaleSequential(d3.interpolateRdBu);

    // Add areas
    rootG.selectAll("areas")
        .data(allDensity)
        .enter()
        .append("path")
        .attr("transform", function (d) {
            return ("translate(0," + yGenre(d.key) + ")")
        })
        .attr("fill", function (d) {
            return colorScale(contrast(d.avg))
        })
        .datum(function (d) {
            return (d.density)
        })
        .attr("stroke", "grey")
        .attr("stroke-width", 0.5)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function (d) {
                return x(d[0]);
            })
            .y(function (d) {
                return densityScale(d[1]);
            }));

    // legend
    let legendG = rootG.append("g")
        .attr("id", "avgScoreLegend")
        .attr("transform", "translate(0, " + (ctx.h - ctx.margin.bottom - ctx.margin.top - 30) + ")");

    // Define the gradient
    let defs = legendG.append("defs");
    let linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    const n = 10; // Number of gradient stops
    for (let i = 0; i <= n; i++) {
        linearGradient.append("stop")
            .attr("offset", `${i/n * 100}%`)
            .attr("stop-color", colorScale(i/n));
    }

    // Draw the color legend
    legendG.append("rect")
        .attr("x", 0)
        .attr("y", 5)
        .attr("width", 300)
        .attr("height", 15)
        .style("fill", "url(#linear-gradient)");
    let legendX = d3.scaleLinear()
        .domain([d3.min(allAvg), d3.median(allAvg), d3.max(allAvg)])
        .range([0, 150, 300]);
    legendG.append("g")
        .attr("transform", "translate(0, 20)")
        .call(d3.axisBottom(legendX).ticks(4));

    // Add a caption
    legendG.append("text")
        .attr("x", 0) // Centered above the legend
        .attr("y", 0) // Position above the legend
        .style("font-size", "11px")
        .style("font-family", "Arial")
        .text("Mean");
}

function kernelDensityEstimator(kernel, X) {
    return function (V) {
        return X.map(function (x) {
            return [x, d3.mean(V, function (v) {
                return kernel(x - v);
            })];
        });
    };
}

function kernelEpanechnikov(k) {
    return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}