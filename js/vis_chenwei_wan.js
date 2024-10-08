const ctxChenwei = {
    w: 825,
    h: 490,
    wr: 700,
    hr: 700,
    ws: 820,
    hs: 950,
    hs_hist: 170,
    margin: {top: 60, right: 30, bottom: 20, left: 110},
    marginR: {top: 350, right: 60, bottom: 60, left: 350},
    marginS: {top: 40, right: 60, bottom: 20, left: 80},
    legend: {h: 70},
    distribution: {h: 90},
    ridge_opacity: 0.85,
    imdb: {},
    tmdb: {},
    imdb_density: [],
    tmdb_density: [],
    state: "Imdb",
    scatterScale: "linear",
    movieShowData: [],
    scatterPlotOpacity: 0.85,
    scatterPlotSize: 27,
    scatterPlotHide: NaN
}

function createVisChenwei() {
    console.log("creating vis by Chenwei ... ")
    // Visualization of actor relations
    let svgRelationG = d3.select("#actorsRelationship").append("svg");
    svgRelationG.attr("width", ctxChenwei.wr);
    svgRelationG.attr("height", ctxChenwei.hr);
    let rootRelationG = svgRelationG.append("g")
        .attr("id", "rootRelationG")
        .attr("transform", "translate(" + ctxChenwei.marginR.left + "," + ctxChenwei.marginR.top + ")");
    // Visualization of correlation between popularity and review score
    let svgScatterPlot = d3.select("#scatterPlotPopularityScore").append("svg");
    svgScatterPlot.attr("width", ctxChenwei.ws);
    svgScatterPlot.attr("height", ctxChenwei.hs);
    let rootScatterPG = svgScatterPlot.append("g")
        .attr("id", "rootScatterPlotPopRevG")
        .attr("transform", "translate(" + ctxChenwei.marginS.left + "," + ctxChenwei.marginS.top + ")");
    // Visualization of Imdb/Tmdb score distribution over genres
    let svgEl = d3.select("#genreImdbDistribution").append("svg");
    svgEl.attr("width", ctxChenwei.w);
    svgEl.attr("height", ctxChenwei.h);
    let rootG = svgEl.append("g").attr("id", "rootDistributionG").attr("transform", "translate(" + ctxChenwei.margin.left + "," + ctxChenwei.margin.top + ")");
    loadDataChenwei(rootG, rootRelationG, rootScatterPG);
    document.getElementById('scatterPlotPopRevScale').addEventListener('change', function () {
        if (this.value === "linear") {
            if (ctxChenwei.scatterScale === "log") {
                ctxChenwei.scatterScale = "linear";
                toggleScatterPlotPopRevScale("linear");
            }
        } else if (this.value === "log") {
            if (ctxChenwei.scatterScale === "linear") {
                ctxChenwei.scatterScale = "log";
                toggleScatterPlotPopRevScale("log");
            }
        }
    });
    document.getElementById('rankType').addEventListener('change', function () {
        if (this.value === "alphabetical") {
            if (ctxChenwei.state === "Imdb") {
                transitionToFixOrder(ctxChenwei.imdb_density, "IMDB");
            } else if (ctxChenwei.state === "Tmdb") {
                transitionToFixOrder(ctxChenwei.tmdb_density, "TMDB");
            }
        } else if (this.value === "mean") {
            if (ctxChenwei.state === "Imdb") {
                transitionToMeanOrder(ctxChenwei.imdb_density, "IMDB");
            } else if (ctxChenwei.state === "Tmdb") {
                transitionToMeanOrder(ctxChenwei.tmdb_density, "TMDB");
            }
        }
    });
    document.getElementById('score').addEventListener('change', function () {
        if (this.value === "imdb") {
            if (ctxChenwei.state === "Tmdb") {
                ctxChenwei.state = "Imdb";
                let rankType = document.getElementById("rankType").value;
                if (rankType === "alphabetical") {
                    transitionToFixOrder(ctxChenwei.imdb_density, "IMDB")
                } else if (rankType === "mean") {
                    transitionToMeanOrder(ctxChenwei.imdb_density, "IMDB")
                }
            }
        } else if (this.value === "tmdb") {
            if (ctxChenwei.state === "Imdb") {
                ctxChenwei.state = "Tmdb";
                let rankType = document.getElementById("rankType").value;
                if (rankType === "alphabetical") {
                    transitionToFixOrder(ctxChenwei.tmdb_density, "TMDB")
                } else if (rankType === "mean") {
                    transitionToMeanOrder(ctxChenwei.tmdb_density, "TMDB")
                }
            }
        }
    });
}

function loadDataChenwei(rootG, rootRelationG, rootScatterPG) {
    Promise.all([d3.csv("data/titles.csv"),
        d3.csv("data/selected_actors.csv"),
        d3.csv("data/actor_relations.csv")]).then((data) => {
        let shows = data[0];
        let actors = data[1];
        let nodes = [];
        actors.forEach((d) => {
            let node = {
                id: d["id"],
                name: d["name"],
                role: d["role"] === "ACTOR" ? 1 : 0
            };
            nodes.push(node);
        });
        let edges = data[2];
        let genreImdb = {};
        let genreTmdb = {};
        let showPR = [];
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
            if (d["imdb_score"] !== "" && d["tmdb_score"] !== "" && d["tmdb_popularity"] !== "") {
                let item = {
                    pop: parseFloat(d["tmdb_popularity"]),
                    score: d["imdb_score"],
                    year: d["release_year"],
                    type: d["type"],
                    title: d["title"]
                };
                showPR.push(item);
            }
        });
        ctxChenwei.imdb = genreImdb;
        ctxChenwei.tmdb = genreTmdb
        plotGenreImdbDistribution(rootG, genreImdb);
        // process nodes and links
        let links = [];
        edges.forEach((e) => {
            let link = {
                source: e["actor1"],
                target: e["actor2"],
                value: e["num"],
                desc: e["shows"]
            };
            links.push(link);
        });
        plotActorRelation(rootRelationG, nodes, links);
        showPR = showPR.filter(d => (d.pop >= 1));
        ctxChenwei.movieShowData = JSON.parse(JSON.stringify(showPR));
        plotScatterPlotPopRev(rootScatterPG, showPR);
    });
}

function plotScatterPlotPopRev(rootG, data) {
    console.log("Plotting Scatter Plot Popularity Score ...");
    let height = ctxChenwei.hs - ctxChenwei.marginS.bottom - ctxChenwei.marginS.top - ctxChenwei.hs_hist;
    let width = ctxChenwei.ws - ctxChenwei.marginS.left - 150;
    let x = d3.scaleLinear()
        .domain([0, 10])
        .range([0, width]);
    let y = d3.scaleLinear()
        .domain([1, d3.max(data.map(d => d.pop))])
        .range([height, 0]);
    rootG.append("g")
        .attr("id", "scatterPlotPopRevX")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10));
    rootG.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + ctxChenwei.marginS.left - 20)
        .attr("y", height + ctxChenwei.marginS.top - 5)
        .text("Review Score");
    rootG.append("g")
        .attr("id", "scatterPlotPopRevY")
        .call(d3.axisLeft(y));
    rootG.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2 + 40)
        .text("Popularity");

    // Add gridlines
    function makeGridlinesX() {
        return d3.axisBottom(x)
            .ticks(10)
    }

    function makeGridlinesY() {
        return d3.axisLeft(y)
            .ticks(10)
    }

    // Add the X gridlines
    rootG.append("g")
        .attr("class", "x-grid")
        .attr("transform", `translate(0,${height})`)
        .attr("fill", "grey")
        .style("opacity", 0.2)
        .call(makeGridlinesX()
            .tickSize(-height)
            .tickFormat("")
        )
    // Add the Y gridlines
    rootG.append("g")
        .attr("class", "y-grid")
        .attr("fill", "grey")
        .style("opacity", 0.2)
        .call(makeGridlinesY()
            .tickSize(-width)
            .tickFormat("")
        );
    let colorProj = d3.scaleLinear()
        .domain([d3.min(data.map(d => d.year)), d3.max(data.map(d => d.year))])
        .range([0, 1]);
    let color = d3.scaleSequential(d3.interpolateBlues);
    let plotG = rootG.append("g").attr("id", "scatterPlotPopRevPlots");
    // Add scattered plots
    // Define the shapes based on style
    let showShape = d3.symbol().type(d3.symbolCircle).size(ctxChenwei.scatterPlotSize);
    let filmShape = d3.symbol().type(d3.symbolCross).size(ctxChenwei.scatterPlotSize);
    // Bind data and create one dot per data point in the "SHOW" group
    let show_data = data.filter(d => (d.type === "SHOW"));
    let movie_data = data.filter(d => (d.type === "MOVIE"));
    plotG.selectAll(".scatter-plot-show")
        .data(show_data)
        .enter()
        .append("path")
        .attr("class", "scatter-plot-show")
        .attr("d", showShape)
        .attr("transform", function (d) {
            return `translate(${x(d.score)},${y(d.pop)})`;
        })
        .style("fill", function (d) {
            return color(colorProj(d.year));
        })
        .style("opacity", ctxChenwei.scatterPlotOpacity)
        .on("mouseover", (event, d) => {
            console.log(d.type)
            if (ctxChenwei.scatterPlotHide !== "SHOW") {
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px")
                    .text(d.title);
            }
        })
        .on("mouseout", (event) => {
            d3.select("#tooltip").style("display", "none");
        });
    plotG.selectAll(".scatter-plot-movie")
        .data(movie_data)
        .enter()
        .append("path")
        .attr("class", "scatter-plot-movie")
        .attr("d", filmShape)
        .attr("transform", function (d) {
            return `translate(${x(d.score)},${y(d.pop)})`;
        })
        .style("fill", function (d) {
            return color(colorProj(d.year));
        })
        .style("opacity", ctxChenwei.scatterPlotOpacity)
        .on("mouseover", (event, d) => {
            if (ctxChenwei.scatterPlotHide !== "MOVIE") {
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px")
                    .text(d.title);
            }
        })
        .on("mouseout", (event) => {
            d3.select("#tooltip").style("display", "none");
        });
    // legend
    let legendG = rootG.append("g")
        .attr("id", "scatterPlotPopRecLegend")
        .attr("transform", "translate(600, 300) rotate(-90)")

    // Define the gradient
    let defs = legendG.append("defs");
    let linearGradient = defs.append("linearGradient")
        .attr("id", "scatterPlotLinearGradient");

    const n = 10; // Number of gradient stops
    for (let i = 0; i <= n; i++) {
        linearGradient.append("stop")
            .attr("offset", `${i / n * 100}%`)
            .attr("stop-color", color(i / n));
    }

    // Draw the color legend
    legendG.append("rect")
        .attr("x", 0)
        .attr("y", 5)
        .attr("width", 300)
        .attr("height", 20)
        .style("fill", "url(#scatterPlotLinearGradient)");
    let legendX = d3.scaleLinear()
        .domain([d3.min(data.map(d => d.year)), d3.max(data.map(d => d.year))])
        .range([0, 300]);
    legendG.append("g")
        .attr("id", "scatterPlotPopRecLegendX")
        .attr("transform", "translate(0, 25)")
        .call(d3.axisBottom(legendX).ticks(4).tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("transform", "translate(13, 33) rotate(90)")
        .style("text-anchor", "end");
    // Add a caption
    legendG.append("text")
        .attr("x", 5)
        .attr("y", 20)
        .attr("transform", "translate(326, 0) rotate(90)")
        .style("font-size", "14px")
        .text("Release Year");

    let typeG = rootG.append("g")
        .attr("id", "scatterPlotPopRevType")
        .attr("transform", "translate(610, 350)");

    let showType = d3.symbol().type(d3.symbolCircle).size(55);
    let filmType = d3.symbol().type(d3.symbolCross).size(55);

    typeG.append("text")
        .text("Type")
        .style("font-size", "14px")
        .attr("transform", "translate(-5, -14)");
    typeG.append("path")
        .attr("d", showType)
        .style("fill", color(colorProj(1989)))
        .attr("transform", "translate(0, 0)");
    typeG.append("text")
        .text("Show")
        .style("font-size", "12px")
        .attr("transform", "translate(10, 4)");
    typeG.append("path")
        .attr("d", filmType)
        .style("fill", color(colorProj(1989)))
        .attr("transform", "translate(0, 17)");
    typeG.append("text")
        .text("Movie")
        .style("font-size", "12px")
        .attr("transform", "translate(10, 21)");

    let hisG = rootG.append("g")
        .attr("id", "scatterPlotPopRevHisG")
        .attr("transform", `translate(0, ${height + 40})`)

    let countByType = data.reduce(function (acc, currentValue) {
        if (!acc[currentValue.type]) {
            acc[currentValue.type] = 0;
        }
        acc[currentValue.type]++;
        return acc;
    }, {});
    let dataForBarChart = Object.keys(countByType).map(function (type) {
        return {type: type, count: countByType[type]};
    });

    let wh = ctxChenwei.ws - ctxChenwei.marginS.left - ctxChenwei.marginS.right;
    let hh = ctxChenwei.hs_hist - ctxChenwei.marginS.bottom - 40;
    let yh = d3.scaleBand()
        .domain(dataForBarChart.map(d => d.type))
        .rangeRound([0, hh])
        .padding(0.3);
    let xh = d3.scaleLinear()
        .domain([0, d3.max(dataForBarChart.map(d => d.count))])
        .range([0, wh]);
    hisG.append('g')
        .attr("id", "scatterPlotHistX")
        .attr('transform', 'translate(0,' + hh + ')')
        .call(d3.axisBottom(xh).ticks(10));
    hisG.append('g')
        .call(d3.axisLeft(yh));
    let colorH = d3.scaleOrdinal()
        .domain(dataForBarChart.map(d => d.type))
        .range(d3.schemeAccent);
    hisG.selectAll('.bar')
        .data(dataForBarChart)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => yh(d.type))
        .attr('width', d => (xh(d.count)))
        .attr('height', yh.bandwidth())
        .attr('fill', d => colorH(d.type))
        .on("click", function (event, d) {
            if (d.type === "SHOW") {
                ctxChenwei.scatterPlotHide = "MOVIE";
                d3.selectAll(".scatter-plot-show")
                    .style("opacity", ctxChenwei.scatterPlotOpacity);
                d3.selectAll(".scatter-plot-movie")
                    .style("opacity", 0);
            } else if (d.type === "MOVIE") {
                ctxChenwei.scatterPlotHide = "SHOW";
                d3.selectAll(".scatter-plot-show")
                    .style("opacity", 0);
                d3.selectAll(".scatter-plot-movie")
                    .style("opacity", ctxChenwei.scatterPlotOpacity);
            }
        })
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .text(d.count);
        })
        .on("mouseout", (event) => {
            d3.select("#tooltip").style("display", "none");
        });
}

function toggleScatterPlotPopRevScale(scale) {
    console.log("Changing Scale to " + scale + "!")
    let data = ctxChenwei.movieShowData;
    let rootG = d3.select("#rootScatterPlotPopRevG");
    let height = ctxChenwei.hs - ctxChenwei.marginS.bottom - ctxChenwei.marginS.top - ctxChenwei.hs_hist;
    let width = ctxChenwei.ws - ctxChenwei.marginS.left - 150;
    let x = d3.scaleLinear()
        .domain([0, 10])
        .range([0, width]);
    let y;
    if (scale === "linear") {
        y = d3.scaleLinear()
            .domain([1, d3.max(data.map(d => d.pop))])
            .range([height, 0]);
    } else if (scale === "log") {
        y = d3.scaleLog()
            .domain([1, d3.max(data.map(d => d.pop))])
            .range([height, 0])
            .nice();
    }
    // Select the y-axis element if it exists
    let yAxis = rootG.selectAll("#scatterPlotPopRevY").data([0]);

    // Transition the y-axis to the new scale
    yAxis.transition()
        .duration(1000)
        .call(d3.axisLeft(y).ticks(null, ".1s"));

    function makeGridlinesY() {
        return d3.axisLeft(y)
            .ticks(null, ".1s")
            .tickSize(-width)
            .tickFormat("");
    }

    // Select the existing gridlines
    let yGridlines = rootG.selectAll(".y-grid");
    // Enter + update
    yGridlines
        .transition()
        .duration(1000)
        .call(makeGridlinesY());
    let show_data = data.filter(d => (d.type === "SHOW"));
    let movie_data = data.filter(d => (d.type === "MOVIE"));
    rootG.selectAll(".scatter-plot-show")
        .data(show_data)
        .transition()
        .duration(1000)
        .attr("transform", function (d) {
            return `translate(${x(d.score)},${y(d.pop)})`;
        });
    rootG.selectAll(".scatter-plot-movie")
        .data(movie_data)
        .transition()
        .duration(1000)
        .attr("transform", function (d) {
            return `translate(${x(d.score)},${y(d.pop)})`;
        });
}

function plotActorRelation(rootG, nodes, links) {
    console.log("Plotting Actor Relations ...");
    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX())
        .force("y", d3.forceY());
    // Add a line for each link, and a circle for each node.

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const link = rootG.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value))
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .text(d.desc);
        })
        .on("mouseout", (event) => {
            d3.select("#tooltip").style("display", "none");
        });

    const node = rootG.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", d => color(d.role))
        .on("mouseover", (event, d) => {
            let role = d.role === 1 ? "Actor" : "Director";
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .text(d.name + ", " + role);
        })
        .on("mouseout", (event) => {
            d3.select("#tooltip").style("display", "none");
        });

    // Add a drag behavior.
    // Add a drag behavior.
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Set the position attributes of links and nodes each time the simulation ticks.
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

function computeDistributionDensity(x, data, threshold) {
    let output = {
        allDensity: [], allAvg: [], maxAllDensity: 0
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

function getPercentile(data, percentile) {
    let dataCopy = JSON.parse(JSON.stringify(data));
    data.sort((a, b) => a - b);
    let index = Math.ceil((percentile / 100) * (data.length - 1));
    return data[index];
}

function plotGenreImdbDistribution(rootG, data) {
    let x = d3.scaleLinear()
        .domain([0, 10.2])
        .range([0, ctxChenwei.w - ctxChenwei.margin.left - ctxChenwei.margin.right]);
    let height = ctxChenwei.h - ctxChenwei.margin.bottom - ctxChenwei.margin.top - ctxChenwei.legend.h;
    rootG.append("g")
        .attr("id", "dis-ridge-x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10));

    let density = computeDistributionDensity(x, data, 100);
    ctxChenwei.imdb_density = density;
    let data2 = ctxChenwei.tmdb;
    ctxChenwei.tmdb_density = computeDistributionDensity(x, data2, 100);
    let allDensity = density.allDensity;
    let allAvg = density.allAvg;
    let maxAllDensity = density.maxAllDensity;

    let yGenre = d3.scaleBand()
        .domain(allDensity.map(d => d.key))
        .range([0, ctxChenwei.h - ctxChenwei.margin.top - ctxChenwei.margin.bottom - ctxChenwei.legend.h])
        .paddingInner(1);
    rootG.append("g")
        .attr("id", "dis-ridge-y-axis")
        .call(d3.axisLeft(yGenre))
        .selectAll("text")
        .style("font-size", "14px"); // Set the font size as desired;

    let densityScale = d3.scaleLinear()
        .domain([0, maxAllDensity])
        .range([0, -ctxChenwei.distribution.h]);

    // color scale
    let contrast = d3.scaleLinear()
        .domain([d3.min(allAvg), getPercentile(allAvg, 25), d3.median(allAvg), getPercentile(allAvg, 75), d3.max(allAvg)])
        .range([0, 0.25, 0.5, 0.75, 1]);
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
        .style("opacity", ctxChenwei.ridge_opacity)
        .attr("stroke-width", 0.5)
        .attr("d", function (d) {
            return lineGenerator(d.density);
        })
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .attr("stroke", "black")
                .attr("stroke-width", 1.5)
                .style("opacity", 1);
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .text("Mean " + Math.round(d.avg * 100) / 100);
        })
        .on("mouseout", (event) => {
            d3.select(event.currentTarget)
                .attr("stroke", "grey")
                .attr("stroke-width", 0.5)
                .style("opacity", ctxChenwei.ridge_opacity);
            d3.select("#tooltip").style("display", "none");
        });

    // legend
    let legendG = rootG.append("g")
        .attr("id", "avgScoreLegend")
        .attr("transform", "translate(0, " + (ctxChenwei.h - ctxChenwei.margin.bottom - ctxChenwei.margin.top - 30) + ")");

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
        .domain([d3.min(allAvg), getPercentile(allAvg, 25), d3.median(allAvg), getPercentile(allAvg, 75), d3.max(allAvg)])
        .range([0, 75, 150, 225, 300]);
    legendG.append("g")
        .attr("id", "dis-legend-x-axis")
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
        .attr("transform", "translate(500, " + (ctxChenwei.h - ctxChenwei.margin.bottom - ctxChenwei.margin.top - 30) + ")")
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
    console.log("Transitioning distribution ridges ... ");
    let allDensity = density.allDensity;
    let allAvg = density.allAvg;
    let maxAllDensity = density.maxAllDensity;

    let rootG = d3.select("#rootDistributionG")

    let x = d3.scaleLinear()
        .domain([0, 10.2])
        .range([0, ctxChenwei.w - ctxChenwei.margin.left - ctxChenwei.margin.right]);

    // transform y-axis
    let yGenre = d3.scaleBand()
        .domain(allDensity.map(d => d.key))
        .range([0, ctxChenwei.h - ctxChenwei.margin.top - ctxChenwei.margin.bottom - ctxChenwei.legend.h])
        .paddingInner(1);
    rootG.select("#dis-ridge-y-axis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(yGenre));
    rootG.select("#dis-ridge-y-axis")
        .selectAll("text")
        .style("font-size", "14px"); // Adjust font size if needed

    // transform ridge graph
    let densityScale = d3.scaleLinear()
        .domain([0, maxAllDensity])
        .range([0, -ctxChenwei.distribution.h]);
    // color scale
    let contrast = d3.scaleLinear()
        .domain([d3.min(allAvg), getPercentile(allAvg, 25), d3.median(allAvg), getPercentile(allAvg, 75), d3.max(allAvg)])
        .range([0, 0.25, 0.5, 0.75, 1]);
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
        .style("opacity", ctxChenwei.ridge_opacity)
        .attr("stroke-width", 0.5)
        .attr("d", function (d) {
            return lineGenerator(d.density);
        });

    // transition for legend x-axis
    let legendX = d3.scaleLinear()
        .domain([d3.min(allAvg), getPercentile(allAvg, 25), d3.median(allAvg), getPercentile(allAvg, 75), d3.max(allAvg)])
        .range([0, 75, 150, 225, 300]);
    rootG.select("#dis-legend-x-axis")
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
