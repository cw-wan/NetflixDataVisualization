const ctx = {
    w: 825, h: 490,
    margin: {top: 60, right: 30, bottom: 20, left: 110},
    legend: {h: 70},
    distribution: {h: 90},
    ridge_opacity: 0.9,
    imdb: {},
    tmdb: {},
    imdb_density: [],
    tmdb_density: [],
    state: "Imdb"
}

function createScoreDistributionViz() {
    let svgEl = d3.select("#genreImdb").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    let rootG = svgEl.append("g").attr("id", "rootG").attr("transform",
        "translate(" + ctx.margin.left + "," + ctx.margin.top + ")");
    loadData(rootG);

    document.getElementById('rankType').addEventListener('change', function() {
        if (this.value === "alphabetical") {
            if (ctx.state === "Imdb") {
                transitionToFixOrder(ctx.imdb_density, "IMDB");
            } else if (ctx.state === "Tmdb") {
                transitionToFixOrder(ctx.tmdb_density, "TMDB");
            }
        } else if (this.value === "mean") {
            if (ctx.state === "Imdb") {
                transitionToMeanOrder(ctx.imdb_density, "IMDB");
            } else if (ctx.state === "Tmdb") {
                transitionToMeanOrder(ctx.tmdb_density, "TMDB");
            }
        }
    });
    document.getElementById('score').addEventListener('change', function() {
        if (this.value === "imdb") {
            if (ctx.state === "Tmdb") {
                ctx.state = "Imdb";
                let rankType = document.getElementById("rankType").value;
                if (rankType === "alphabetical") {
                    transitionToFixOrder(ctx.imdb_density, "IMDB")
                } else if (rankType === "mean") {
                    transitionToMeanOrder(ctx.imdb_density, "IMDB")
                }
            }
        } else if (this.value === "tmdb") {
            if (ctx.state === "Imdb") {
                ctx.state = "Tmdb";
                let rankType = document.getElementById("rankType").value;
                if (rankType === "alphabetical") {
                    transitionToFixOrder(ctx.tmdb_density, "TMDB")
                } else if (rankType === "mean") {
                    transitionToMeanOrder(ctx.tmdb_density, "TMDB")
                }
            }
        }
    });
}

function loadData(rootG) {
    Promise.all([d3.csv("data/titles.csv"), d3.csv("data/credits.csv")]).then((data) => {
        let shows = data[0];
        let genreImdb = {};
        let genreTmdb = {};
        shows.forEach((d) => {
            let genres = JSON.parse(d["genres"].replace(/'/g, '\"'));
            for (let genre of genres) {
                if (d["imdb_score"] !== "") {
                    if (genreImdb[genre] === undefined) {
                        genreImdb[genre] = [parseFloat(d["imdb_score"]),];
                    } else {
                        genreImdb[genre].push(parseFloat(d["imdb_score"]));
                    }
                }
                if (d["tmdb_score"] !== "") {
                    if (genreTmdb[genre] === undefined) {
                        genreTmdb[genre] = [parseFloat(d["tmdb_score"])];
                    } else {
                        genreTmdb[genre].push(parseFloat(d["tmdb_score"]))
                    }
                }
            }
        });
        ctx.imdb = genreImdb;
        ctx.tmdb = genreTmdb
        plotGenreImdbDistribution(rootG, genreImdb);
    });
}

function computeDistributionDensity(x, data, threshold) {
    let output = {
        allDensity: [],
        allAvg: [],
        maxAllDensity: 0
    };
    let kde = kernelDensityEstimator(kernelEpanechnikov(0.03), x.ticks(45));
    for (let genre of Object.keys(data)) {
        let density = kde(data[genre]);
        let maxDensity = d3.max(density, (d) => (d[1]));
        let avgScore = d3.mean(data[genre]);
        output.allAvg.push(avgScore);
        if (maxDensity > output.maxAllDensity) {
            output.maxAllDensity = maxDensity;
        }
        output.allDensity.push({key: genre, density: density, avg: avgScore, size: data[genre].length});
    }
    output.allDensity = output.allDensity.filter(d => (d.size > threshold))
    output.allDensity.sort(function (x, y) {
        return d3.descending(x.avg, y.avg);
    });
    return output;
}

function plotGenreImdbDistribution(rootG, data) {
    let x = d3.scaleLinear()
        .domain([0, 10.2])
        .range([0, ctx.w - ctx.margin.left - ctx.margin.right]);
    let height = ctx.h - ctx.margin.bottom - ctx.margin.top - ctx.legend.h;
    rootG.append("g")
        .attr("id", "ridge-x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10));

    let density = computeDistributionDensity(x, data, 100);
    ctx.imdb_density = density;
    let data2 = ctx.tmdb;
    ctx.tmdb_density = computeDistributionDensity(x, data2, 100);
    let allDensity = density.allDensity;
    let allAvg = density.allAvg;
    let maxAllDensity = density.maxAllDensity;

    let yGenre = d3.scaleBand()
        .domain(allDensity.map(d => d.key))
        .range([0, ctx.h - ctx.margin.top - ctx.margin.bottom - ctx.legend.h])
        .paddingInner(1);
    rootG.append("g")
        .attr("id", "ridge-y-axis")
        .call(d3.axisLeft(yGenre))
        .selectAll("text")
        .style("font-size", "14px"); // Set the font size as desired;

    let densityScale = d3.scaleLinear()
        .domain([0, maxAllDensity])
        .range([0, -ctx.distribution.h]);

    // color scale
    let contrast = d3.scaleLinear()
        .domain([d3.min(allAvg), d3.median(allAvg), d3.max(allAvg)])
        .range([0, 0.5, 1]);
    let colorScale = d3.scaleSequential(d3.interpolateRdBu);

    // Add areas
    let ridgeG = rootG.append("g").attr("id", "ridgeG");
    let lineGenerator = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) {
            return x(d[0]);
        })
        .y(function (d) {
            return densityScale(d[1]);
        });
    ridgeG.selectAll("areas")
        .data(allDensity)
        .enter()
        .append("path")
        .attr("transform", function (d) {
            return ("translate(0," + yGenre(d.key) + ")")
        })
        .attr("fill", function (d) {
            return colorScale(contrast(d.avg))
        })
        .attr("stroke", "grey")
        .style("opacity", ctx.ridge_opacity)
        .attr("stroke-width", 0.5)
        .attr("d", function (d) {
            return lineGenerator(d.density);
        });

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
            .attr("offset", `${i / n * 100}%`)
            .attr("stop-color", colorScale(i / n));
    }

    // Draw the color legend
    legendG.append("rect")
        .attr("x", 0)
        .attr("y", 5)
        .attr("width", 300)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)");
    let legendX = d3.scaleLinear()
        .domain([d3.min(allAvg), d3.median(allAvg), d3.max(allAvg)])
        .range([0, 150, 300]);
    legendG.append("g")
        .attr("id", "legend-x-axis")
        .attr("transform", "translate(0, 25)")
        .call(d3.axisBottom(legendX).ticks(4));

    // Add a caption
    legendG.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "14px")
        .style("font-family", "Arial")
        .text("Mean");

    // Add description
    let textG = rootG.append("g")
        .attr("transform", "translate(500, " + (ctx.h - ctx.margin.bottom - ctx.margin.top - 30) + ")")
    textG.append("text")
        .attr("id", "desc")
        .attr("x", 0)
        .attr("y", 20)
        .style("font-size", "18px")
        .style("font-family", "Arial")
        .text("IMDB Score");
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

function transitionTo(density, name) {
    let allDensity = density.allDensity;
    let allAvg = density.allAvg;
    let maxAllDensity = density.maxAllDensity;

    let rootG = d3.select("#rootG")

    let x = d3.scaleLinear()
        .domain([0, 10.2])
        .range([0, ctx.w - ctx.margin.left - ctx.margin.right]);

    // transform y-axis
    let yGenre = d3.scaleBand()
        .domain(allDensity.map(d => d.key))
        .range([0, ctx.h - ctx.margin.top - ctx.margin.bottom - ctx.legend.h])
        .paddingInner(1);
    rootG.select("#ridge-y-axis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(yGenre));
    rootG.select("#ridge-y-axis")
        .selectAll("text")
        .style("font-size", "14px"); // Adjust font size if needed

    // transform ridge graph
    let densityScale = d3.scaleLinear()
        .domain([0, maxAllDensity])
        .range([0, -ctx.distribution.h]);
    // color scale
    let contrast = d3.scaleLinear()
        .domain([d3.min(allAvg), d3.median(allAvg), d3.max(allAvg)])
        .range([0, 0.5, 1]);
    let colorScale = d3.scaleSequential(d3.interpolateRdBu);

    // areas
    let ridgeG = d3.select("#ridgeG");
    let lineGenerator = d3.line()
        .curve(d3.curveBasis)
        .x(function (d) {
            return x(d[0]);
        })
        .y(function (d) {
            return densityScale(d[1]);
        });
    ridgeG.selectAll("path")
        .data(allDensity)
        .transition()
        .duration(1000)
        .attr("transform", function (d) {
            return ("translate(0," + yGenre(d.key) + ")")
        })
        .attr("fill", function (d) {
            return colorScale(contrast(d.avg))
        })
        .attr("stroke", "grey")
        .style("opacity", ctx.ridge_opacity)
        .attr("stroke-width", 0.5)
        .attr("d", function (d) {
            return lineGenerator(d.density);
        });

    // transition for legend x-axis
    let legendX = d3.scaleLinear()
        .domain([d3.min(allAvg), d3.median(allAvg), d3.max(allAvg)])
        .range([0, 150, 300]);
    rootG.select("#legend-x-axis")
        .transition()
        .duration(1000)
        .attr("transform", "translate(0, 25)")
        .call(d3.axisBottom(legendX).ticks(4));

    rootG.select("#desc")
        .transition()
        .duration(1000)
        .attr("x", 0)
        .attr("y", 20)
        .style("font-size", "18px")
        .style("font-family", "Arial")
        .text(name + " Score");
}

function transitionToFixOrder(density, name) {
    let newDensity = density;
    newDensity.allDensity.sort(function (x, y) {
        return d3.ascending(x.key, y.key);
    });
    transitionTo(newDensity, name);
}

function transitionToMeanOrder(density, name) {
    let newDensity = density;
    newDensity.allDensity.sort(function (x, y) {
        return d3.descending(x.avg, y.avg);
    });
    transitionTo(newDensity, name);
}
