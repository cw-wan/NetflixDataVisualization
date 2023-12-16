// histograms for numerical attributes
let attributes = [

    {key: "imdb_score", label: "imdb score"},
    {key: "tmdb_score", label: "tmdb score"},
    {key: "imdb_votes", label: "imdb votes"},
    {key: "release_year", label: "release year"},
    {key: "runtime", label: "runtime"},
    {key: "seasons", label: "seasons"},


];

function selectType(type, Data) {

    let filteredData = Data.filter(function (d) {
        return d.type === type;
    });

    // console.log(Data,filteredData )
    return filteredData
}


function Select_Show_Movie() {
    // Selection bars
    d3.select("#percentage_show_bar").on("mouseover", function () {
        // console.log("m over"); // Print "hello" to the console
        d3.select("#percentage_show_bar").attr("stroke", "black").attr("stroke-width", 2)
        d3.select("#percentage_movie_bar").attr("opacity", 0.2)
        d3.select("#barG2").attr("opacity", 0.2)
        d3.select("#barG").attr("opacity", 1)


    })
        .on("click", function () {
            // Function to be executed on mouseover
            // console.log("show")
            d3.select("#barG2").attr("opacity", 0.2)
            d3.select("#barG").attr("opacity", 1)
        })
        .on("mouseleave", function () {
            // Function to be executed on mouseleave
            d3.select("#percentage_show_bar").attr("stroke", null);
            d3.select("#percentage_movie_bar").attr("opacity", 1)
            d3.select("#barG2").attr("opacity", 1)
            d3.select("#barG").attr("opacity", 1)

        });

    // Selection bars
    d3.select("#percentage_movie_bar").on("mouseover", function () {
        // console.log("m over"); // Print "hello" to the console
        d3.select("#percentage_movie_bar").attr("stroke", "black").attr("stroke-width", 2)
        d3.select("#percentage_show_bar").attr("opacity", 0.2)
        d3.select("#barG").attr("opacity", 0.2)
        d3.select("#barG2").attr("opacity", 1)
        // You can replace the console.log with any action you want

    })
        .on("click", function () {
            // Function to be executed on mouseover
            // console.log("movie ");
            d3.select("#barG").attr("opacity", 0.2)
            d3.select("#barG2").attr("opacity", 1)
        })
        .on("mouseleave", function () {
            // Function to be executed on mouseleave
            d3.select("#percentage_movie_bar").attr("stroke", null);
            d3.select("#percentage_show_bar").attr("opacity", 1)
            d3.select("#barG2").attr("opacity", 1)
            d3.select("#barG").attr("opacity", 1)

        });


}

function clearCanvas() {
    d3.select("#bkgG").selectAll(".x-axis").remove();
    d3.select("#bkgG").selectAll(".x-label").remove();
    d3.select("#bkgG").selectAll(".y-axis").remove();
    d3.select("#bkgG").selectAll(".y-label").remove();
    d3.select("#barG").selectAll(".bar").remove();
    d3.select("#barG2").selectAll(".bar").remove();
}


function initSVGcanvas_hist_numeric(Data) {
    let ShowData = selectType("SHOW", Data)
    let MovieData = selectType("MOVIE", Data)

    let ShowNb = ShowData.length
    let MovieNb = MovieData.length
    let AllNb = ShowNb + MovieNb
    let ShowPercentage = ShowNb / AllNb
    let MoviePercentage = MovieNb / AllNb


    let width = 500;
    let margin = 40;
    let height = 500;
    let right_side = 300
    let barColor = "#bd7ebe";


    let outersvg = d3.select("#histogram")
        .append("svg")
        .attr("id", "outersvg_hist_numeric")
        .attr("width", width + margin + right_side)
        .attr("height", height + margin);

    let right_svg = outersvg.append("svg")
        .attr("id", "rightsvg_hist_numeric")
        .attr("width", right_side)
        .attr("height", height + margin)
        .attr("x", 500)
        .attr("y", 0);

    let Scale_percentage = d3.scaleLinear()
        .domain([1, 0]) // Data domain
        .range([0, height - margin]); // SVG width

    let MovieColor = "#ffb400"
    let ShowColor = "#9080ff"


    let bar_percentage_group = right_svg.append("g").attr("id", "bar_percentage_group");

    // Append bars to represent proportions
    bar_percentage_group.append("rect")
        .attr("class", "bar")
        .attr("id", "percentage_movie_bar")
        .attr("x", 2 * margin) // Adjust x position for each bar
        .attr("y", margin + 0)
        .attr("width", 35) // Fixed width for the bars
        .attr("height", Scale_percentage(ShowPercentage))// Bar height based on percentage
        .attr("fill", MovieColor);

    bar_percentage_group.append("rect")
        .attr("class", "bar")
        .attr("id", "percentage_show_bar")
        .attr("x", 2 * margin) // Adjust x position for each bar
        .attr("y", margin + Scale_percentage(ShowPercentage))
        .attr("width", 35) // Fixed width for the bars
        .attr("height", Scale_percentage(MoviePercentage))// Bar height based on percentage
        .attr("fill", ShowColor);
    let yAxis_percentage = d3.axisRight(Scale_percentage).tickFormat(d3.format(".0%")).ticks(5);
    right_svg.append("g").attr("id", "yAxis_percentage")
        .attr("transform", "translate(140, 40)")  // Adjust the y-position as needed
        .call(yAxis_percentage);
    let legend = right_svg.append("g").attr("id", "legend_percentage");
    legend.append("rect").attr("x", 180).attr("y", 80)
        .attr("width", 18).attr("height", 18)
        .style("fill", MovieColor);

    legend.append("text").attr("x", 200).attr("y", 85)
        .attr("dy", ".6em").style("text-anchor", "start")
        .style("font-size", "12pt").text("Movie 64%");

    legend.append("rect").attr("x", 180).attr("y", 120)
        .attr("width", 18).attr("height", 18)
        .style("fill", ShowColor);

    legend.append("text").attr("x", 200).attr("y", 125)
        .attr("dy", ".6em").style("text-anchor", "start")
        .style("font-size", "12pt").text("Show 36%");


    var svg = d3.select("#outersvg_hist_numeric")
        .append("svg")
        .attr("id", "hist_numeric")
        .attr("width", width + margin)
        .attr("height", height + margin);
    console.log("Creating histogram using D3 v" + d3.version);
    // creating the SVG canvas

    // console.log(Data)

    // an SVG group for background elements (axes, labels)
    let rootG = svg.append("g").attr("id", "rootG");
    rootG.append("g").attr("id", "bkgG");
    rootG.append("g").attr("id", "barG");
    rootG.append("g").attr("id", "barG2");

    // sselect an attribute
    let select = d3.select("#attributeSelect");

    select.selectAll("option")
        .data(attributes)
        .enter()
        .append("option")
        .attr("value", d => d.key)
        .text(d => d.label);


    // select number of bins
    let binsSlider = d3.select("#binsSlider");
    // let binsSlider = d3.getElementById("binsSlider");
    d3.select("#binsSlider")
        .attr("max", 10);


    let binsValue = d3.select("#binsValue");


    function updateHistogram(selectedAttribute, numBins) {

        clearCanvas();

        // Extract the selected attribute values from the data.

        let selectedData = ShowData.map(d => d[selectedAttribute]);
        let selectedData2 = MovieData.map(d => d[selectedAttribute]);
        let AllSelectedData = Data.map(d => d[selectedAttribute]);

        xScale = d3.scaleLinear() // on x axis, they should have same scale
            .domain([d3.min(selectedData), d3.max(selectedData)])
            .range([margin * 2, width]);


        let domain = xScale.domain();
        let binWidth = Math.ceil((domain[domain.length - 1] - domain[0]) / numBins);
        // width of bar should halfed


        // Generate thresholds aligned with discrete year values within the defined domain
        let thresholds = Array.from({length: numBins + 1}, (_, i) => domain[0] + i * binWidth)
            .filter(threshold => threshold <= domain[domain.length - 1]);

        thresholds[numBins] = domain[1]

        // console.log(thresholds);
        thresholds = thresholds.filter(element => element !== undefined);

        let histogram = d3.histogram()
            .value(d => d)
            .domain(domain)
            .thresholds(thresholds);


        // Generate the histogram data.
        let bins = histogram(selectedData);
        let bins2 = histogram(selectedData2);
        let bin_all = histogram(AllSelectedData);

        let index_bins = 0
        bins.forEach(element => {
            // console.log("element.length",element.length)
            // console.log("bin2 length",bins2[index_bins].length)
            bins2[index_bins].previous_length = element.length
            // console.log(bins2[index_bins])
            // console.log("bin2 length",bins2[index_bins].length)

            // console.log("concat",concat)
            // concated_counts.push(concat)

            index_bins = index_bins + 1
        });
        // console.log(bins,bins2,bin_all)
        let DataToViz = [{Type: "show", ShowData}, {Type: "movie", MovieData}]
        let allbintoviz = [{show: bins}, {movie: bins2}]

        // Define the scale for the y-axis (movie counts).
        yScale = d3.scaleLinear()
            .domain([0, d3.max(bin_all, d => d.length)])
            .range([height, margin]);
        // console.log("bins",bins)

        // Create and append the bars to the SVG.
        svg.select("#barG").selectAll(".bar")
            .data(bins)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", ShowColor)
            .attr("x", function (d) {
                // console.log("d",d)
                return xScale(d.x0) + 1
            })
            .attr("width", d => (xScale(d.x1) - xScale(d.x0)))
            .attr("y", d => yScale(d.length))
            .attr("height", d => height - yScale(d.length))
            .attr("stroke", "white") // Add stroke color
            .attr("stroke-width", 1); // Adjust stroke width as needed;
        // svg.select("#barG").selectAll(".bar")
        //     .data(bins)
        //     .enter()
        //     .append("rect")
        //     .attr("class", "bar")
        //     .attr("fill", ShowColor)
        //     .attr("x", d => xScale(d.x0)+1)
        //     .attr("width", d => (xScale(d.x1) - xScale(d.x0)))
        //     .attr("y", d => yScale(d.length))
        //     .attr("height", d => height - yScale(d.length))
        //     .attr("stroke", "white") // Add stroke color
        //     .attr("stroke-width", 1); // Adjust stroke width as needed;

        svg.select("#barG2").selectAll(".bar")
            .data(bins2)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", MovieColor)
            .attr("x", d => xScale(d.x0) + 1)
            .attr("width", d => (xScale(d.x1) - xScale(d.x0)))
            .attr("y", function (d) {
                    let length_new_bar = height - yScale(d.length)
                    let y_pos = yScale(d.previous_length) - length_new_bar
                    return y_pos
                }
            )
            .attr("height", function (d) {
                let length_new_bar = height - yScale(d.length)
                // return h_bar
                return length_new_bar
            })
            .attr("stroke", "white") // Add stroke color
            .attr("stroke-width", 1); // Adjust stroke width as needed;


        // Create x-axis and y-axis.

        let axis = d3.axisBottom(xScale);

        // Generate the ticks
        let ticks = axis.scale().ticks(10); // Adjust the number of ticks as needed


        svg.select("#bkgG").append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(${0},${height})`)
            .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d"))) //正常应该用这个，自动加标签


        svg.select("#bkgG").append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin * 2},${0})`)
            .call(d3.axisLeft(yScale));

        // Add labels to the axes.
        let labelForTitle = attributes.find(attr => attr.key === selectedAttribute).label;

        svg.select("#bkgG").append("text")
            .attr("class", "x-label")
            .attr("x", width / 2)
            .attr("y", height + margin * 0.8)
            .text(`${labelForTitle}`);
        // .text(`${attributes[selectedAttribute]}`);

        svg.select("#bkgG").append("text")
            .attr("class", "y-label")
            .attr("transform", `translate(${margin * 0.8},${margin / 2 + height / 2}),rotate(-90)`)
            .text("Count");

        // tooltip
        let tooltip = svg.select(".barG")
            .append("div")
            .attr("class", "svg-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden");

        // select all rect
        svg.select("#barG").selectAll(".bar")
            .on("mouseover", function (event, d) {// change the selection style
                d3.select(this)
                    .append("title")
                    .text((d) => (` Show:\n${selectedAttribute}: ${d.x0} ~ ${d.x1}\n Count : ${d.length}\n`))
                    .attr('stroke-width', '2')
                    .attr("stroke", "black");
                tooltip.style("visibility", "visible");
            })
            .on("mousemove", function (event, d) {
                tooltip.style("top", `${event.pageY - 10} px`)
                    .style("left", `${event.pageX + 10} px`);
            })
            .on("mouseout", function () {// change the selection style
                d3.select(this).attr('stroke-width', '2');
                tooltip.style("visibility", "hidden");
            });
        svg.select("#barG2").selectAll(".bar")
            .on("mouseover", function (event, d) {// change the selection style
                d3.select(this)
                    .append("title")
                    .text((d) => (` Movie:\n${selectedAttribute}: ${d.x0} ~ ${d.x1}\n Count : ${d.length}\n`))
                    .attr('stroke-width', '2')
                    .attr("stroke", "black");
                tooltip.style("visibility", "visible");
            })
            .on("mousemove", function (event, d) {
                tooltip.style("top", `${event.pageY - 10} px`)
                    .style("left", `${event.pageX + 10} px`);
            })
            .on("mouseout", function () {// change the selection style
                d3.select(this).attr('stroke-width', '2');
                tooltip.style("visibility", "hidden");
            });
    }


    //
    updateHistogram("imdb_score", 100);

    select.on("change", function () {
        let selectedAttribute = this.value;
        if (selectedAttribute == "imdb_votes" || selectedAttribute == "runtime") {
            d3.select("#binsSlider")
                .attr("max", 100);
        } else if (selectedAttribute == "release_year") {
            d3.select("#binsSlider")
                .attr("max", 70);
        } else {
            d3.select("#binsSlider")
                .attr("max", 10);
        }
        let numBins = binsSlider.node().value;
        // clearCanvas();
        updateHistogram(selectedAttribute, numBins);
    });

    binsSlider.on("input", function () {
        let selectedAttribute = select.node().value;
        if (selectedAttribute == "imdb_votes" || selectedAttribute == "runtime") {
            d3.select("#binsSlider")
                .attr("max", 100);
        } else if (selectedAttribute == "release_year") {
            d3.select("#binsSlider")
                .attr("max", 70);
        } else {
            d3.select("#binsSlider")
                .attr("max", 10);
        }


        let numBins = this.value;
        binsValue.text(numBins);
        updateHistogram(selectedAttribute, numBins);
    });


}


function createViz_hist_numeric() {
    loadData_hist_numeric();
};

// genres
function Process_Data_Genres(Data) {
    let yearsData = Data.map(d => d["release_year"])
    let yearsExt = d3.extent(yearsData) // d3.extent(years)[0]=1945, d3.extent(years)[1]=2022

    let selectedData = Data.map(d => d["genres"]); // all the data in all the years
    var parsedData = selectedData.map(function (str) {
        return JSON.parse(str.replace(/'/g, "\""));
    });
    let flattenedData = d3.merge(parsedData);

    let counts = d3.rollups(flattenedData, d => d.length, d => d); //this is an array
    let counts_genre_total = {} //this is a fictionary
    counts.forEach(function (item) {
        counts_genre_total[item[0]] = item[1];
    });
    // console.log("data processed")

    return counts_genre_total
}

function initSVGcanvas_hist_cat(Data) {
    let width = 500;
    let margin = 40;
    let height = 500;
    let barColor = "#1984c5";
    // scales to compute (x,y) coordinates from data values to SVG canvas
    // creating the SVG canvas 
    let svg = d3.select("#histogram_categorical")
        .append("svg")
        .attr("id", "hist_cat")
        .attr("width", width + margin)
        .attr("height", height + margin);


    let rootG = svg.append("g").attr("id", "rootG_cat");
    rootG.append("g").attr("id", "bkgG_cat");
    rootG.append("g").attr("id", "barG_cat");

    // processing genres data
    let counts_genre_total = Process_Data_Genres(Data)

    let values = Object.values(counts_genre_total)
    let maxValue = d3.max(values);
    let y_scale = d3.scaleLinear() //the counts 
        .domain([0, maxValue]).nice()
        .range([height * 0.75 + margin, margin])

    let data = Object.entries(counts_genre_total);
    // console.log(data);
    data.sort(function (a, b) {
        return b[1] - a[1]; // Descending order
    });

    let keys = Object.keys(counts_genre_total)

    let x_scale = d3.scaleBand()
        .domain(data.map(function (d) {
            return d[0];
        }))
        .range([margin * 2, width])
        .padding(0.1);

    svg.selectAll("#barG_cat").selectAll(".bar_cat")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar_cat")
        .attr("fill", barColor)
        .attr("x", d => x_scale(d[0]))
        .attr("y", d => y_scale(d[1]))
        .attr("width", x_scale.bandwidth())
        .attr("height", d => margin + height * 0.75 - y_scale(d[1]));


// add axis
    svg.select("#bkgG_cat").append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${0},${margin + height * 0.75 + 10})`)
        .call(d3.axisBottom(x_scale))
        .selectAll("text")
        .style("text-anchor", "end") // Set text-anchor to the end (right)
        .attr("dx", "-0.3em") // Adjust the x-offset for the text
        .attr("dy", "0.15em") // Adjust the y-offset for the text
        .attr("transform", "rotate(-45)")
    ;

    svg.select("#bkgG_cat").append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin * 2},${0})`)
        .call(d3.axisLeft(y_scale));

    // // Add labels to the axes.
    svg.select("#bkgG_cat").append("text")
        .attr("class", "x-label")
        .attr("x", width / 2)
        .attr("y", height + margin * 0.8)
        .text("Genres");

    svg.select("#bkgG_cat").append("text")
        .attr("class", "y-label")
        .attr("transform", `translate(${margin * 0.8},${margin / 2 + height / 2}),rotate(-90)`)
        .text("Count");

    // tooltip
    let tooltip = svg.select("#barG")
        .append("div")
        .attr("class", "svg-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

// select all rect
    svg.select("#barG_cat").selectAll(".bar_cat")
        .on("mouseover", function (event, d) {// change the selection style
            // console.log(d.length)
            d3.select(this)
                .append("title")
                .text((d) => (` Genre: ${d[0]}\n Count : ${d[1]}\n`))
                .attr('stroke-width', '2')
                .attr("stroke", "black");
            // make the tooltip visible and update its text
            tooltip.style("visibility", "visible");


        })
        .on("mousemove", function (event, d) {
            // console.log(event.pageX,event.pageY)
            tooltip
                .style("top", `${event.pageY - 10} px`)
                .style("left", `${event.pageX + 10} px`);
        })
        .on("mouseout", function () {// change the selection style
            d3.select(this).attr('stroke-width', '0');
            tooltip.style("visibility", "hidden");
        });

}

// tree map genre
function Process_Data_Genres(Data) {
    let yearsData = Data.map(d => d["release_year"])
    let yearsExt = d3.extent(yearsData) // d3.extent(years)[0]=1945, d3.extent(years)[1]=2022

    let selectedData = Data.map(d => d["genres"]); // all the data in all the years
    var parsedData = selectedData.map(function (str) {
        return JSON.parse(str.replace(/'/g, "\""));
    });
    let flattenedData = d3.merge(parsedData);

    let counts = d3.rollups(flattenedData, d => d.length, d => d); //this is an array
    let counts_genre_total = {} //this is a fictionary
    counts.forEach(function (item) {
        counts_genre_total[item[0]] = item[1];
    });
    // console.log("data processed")

    return counts_genre_total
}

function initSVGcanvas_treemap_genres(Data) {
    let width = 500;
    let margin = 110;
    let height = 500;
    let barColor = "#1984c5";
    // scales to compute (x,y) coordinates from data values to SVG canvas
    // creating the SVG canvas
    let svg = d3.select("#treemap_categorical")
        .append("svg")
        .attr("id", "treemap_cat")
        .attr("width", width + margin)
        .attr("height", height);


    let rootG = svg.append("g").attr("id", "rootG_cat_tree");
    rootG.append("g").attr("id", "bkgG_cat_tree");
    rootG.append("g").attr("id", "cat_tree");

    // processing genres data
    let counts_genre_total = Process_Data_Genres(Data)
    // console.log(counts_genre_total)
    tabularData = [["Origin"]]
    Object.entries(counts_genre_total).map(function ([genre, count]) {
        tabularData.push([genre, "Origin", count]);
    });
    // console.log(tabularData)

    let customColors = ["#d7e1ee", "#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7", "#ea5545", "#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4"];

    let color = d3.scaleOrdinal()
        .domain(tabularData.map(d => d[0]))
        .range(customColors)
    // console.log(color("Origin"))

    let root = d3.stratify()
        .id(function (d) {
            return d[0];
        })   // Name of the entity (column name is name in csv)
        .parentId(function (d) {
            return d[1];
        })   // Name of the parent (column name is parent in csv)
        (tabularData);
    root.sum(function (d) {
        return +d[2]
    })   // Compute the numeric value for each entity

    d3.treemap()
        .size([width, height])
        .padding(4)
        (root)


    svg.select("#rootG_cat_tree").select("#cat_tree")
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("class", "leaf_genre")
        .attr('x', function (d) {
            return d.x0;
        })
        .attr('y', function (d) {
            return d.y0;
        })
        .attr('width', function (d) {
            return d.x1 - d.x0;
        })
        .attr('height', function (d) {
            return d.y1 - d.y0;
        })
        .style("stroke", "grey")
        .style('stroke-width', 0.5)
        .style("fill", d => (color(d.data[0])))
        .attr("opacity", 0.5)
    ;

    svg.select("#cat_tree").append('defs')
        .selectAll('clipPath')
        .data(root.leaves())
        .enter()
        .append('clipPath')
        .attr('id', function (d, i) {
            return 'clip-' + i;
        })
        .append('rect')
        .attr('x', function (d) {
            return d.x0;
        })
        .attr('y', function (d) {
            return d.y0;
        })
        .attr('width', function (d) {
            return d.x1 - d.x0;
        })
        .attr('height', function (d) {
            return d.y1 - d.y0;
        });

    svg.select("#cat_tree").selectAll(".rect").data(root.leaves()).enter()
        .append("text")
        .attr("x", function (d) {
            return d.x0 + 5
        })    // +10 to adjust position (more right)
        .attr("y", function (d) {
            return d.y0 + 15
        })
        .attr('clip-path', function (d, i) {
            return 'url(#clip-' + i + ')';
        })  // Apply clipPath
        .text(function (d) {
            return d.data[0] + ": " + d.data[2]
        })
        .attr("font-size", "10px")
        .attr("fill", "black")


    // legend

    var legend = svg.select("#bkgG_cat_tree").selectAll(".legend")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(510," + i * 25 + ")";
        });

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 15)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => (color(d.data[0])))
        .style("opacity", 0.5);

    legend.append("text")
        .attr("x", 20)
        .attr("y", 20)
        .attr("dy", ".6em")
        .style("text-anchor", "start")
        .style("font-size", "8pt")
        .text(function (d) {
            return d.data[0];
        });


}

// Genre by time
function initSVGcanvas_GenreByTime(Data) {
    // scales to compute (x,y) coordinates from data values to SVG canvas
    // creating the SVG canvas
    let h = 500
    let w = 900
    let margin = 40
    let svg = d3.select("#GenreByTime")
        .append("svg")
        .attr("id", "svg_GenreByTime")
        .attr("width", w + 4.5 * margin)
        .attr("height", h + margin);


    let rootG = svg.append("g").attr("id", "rootG_GenreByTime");
    rootG.append("g").attr("id", "bkgG_GenreByTime");
    rootG.append("g").attr("id", "barG_GenreByTime");


    let selectedData = Data.map(function (d) {
            // yeardata = d["release_year"]+"-01-01";
            yeardata = d["release_year"]
            return {genres: d["genres"], release_year: yeardata};
        }
    ); // all the data in all the years

    let yearsData = selectedData.map(d => d["release_year"])
    let yearsExt = d3.extent(yearsData) // d3.extent(years)[0]=1945, d3.extent(years)[1]=2022

    var uniqueYears = Array.from(new Set(yearsData));
    // console.log(uniqueYears)


    let GenreTimeArray = []
    var parsedData = selectedData.map(function (str) {
        d = JSON.parse(str["genres"].replace(/'/g, "\""))
        let t = str["release_year"]
        d.forEach(element => {
            GenreTimeArray.push({genres: element, release_year: t})

        });

    });
    // console.log(GenreTimeArray)

    var groupedData = d3.groups(GenreTimeArray, d => d.genres, d => d.release_year);

    var nestedData = Array.from(groupedData, ([genres, yearData, values]) => ({
        genres: genres,
        values: Array.from(yearData, ([year, values]) => ({release_year: +year, count: values.length})),
    }));
    let GroupedDataCnt = []

    groupedData.forEach(element => {
            g = element[0]
            element[1].forEach(d => {
                    t = d[0]
                    if (uniqueYears.includes(t)) {
                    }
                    cnt = d[1].length
                    GroupedDataCnt.push({genres: g, release_year: t, count: cnt})
                }
            )
        }
    )

    var uniqueGenres = Array.from(new Set(GroupedDataCnt.map(d => d.genres)));
    // console.log(uniqueGenres)

    let yearInterval = 4
    var yearsArray = [];
    for (var year = 1953; year <= 2021; year += yearInterval) {
        yearsArray.push(year.toString());
    }
    // console.log(yearsArray.length);
    var YearpairsList = [];
    YearpairsList.push([(yearsArray[0] - 1).toString(), yearsArray[1]])
    for (var i = 1; i < yearsArray.length - 2; i += 1) {
        YearpairsList.push([yearsArray[i], yearsArray[i + 1]]);
    }
    YearpairsList.push([yearsArray[yearsArray.length - 2], "2022"])

// Output the result
// console.log(YearpairsList);

    function find_cnt_genre_yearInterval(year_start, year_end, genre) {
        FoundData = GroupedDataCnt.filter(d => d.release_year >= year_start && d.release_year < year_end && d.genres == genre)
        totalCount = d3.sum(FoundData, function (d) {
            return d.count;
        })

        return totalCount
    }

    let GroupedDataCnt_Interval = []
    idx = 0
    uniqueGenres.forEach(function (d) {
            genre = d
            // console.log(genre)
            YearpairsList.forEach(
                function (d) {
                    year_start = d[0]
                    year_end = d[1]
                    cnt_Interval = find_cnt_genre_yearInterval(year_start, year_end, genre)
                    // console.log(year_start,year_end ,genre, cnt_Interval)
                    t = new Date(year_start, 0)
                    if (t == '1944') {
                        t = new Date('1945', 0)
                    }
                    GroupedDataCnt_Interval.push({genres: genre, release_year: t, count: cnt_Interval})
                }
            )
        }
    )
    // console.log(GroupedDataCnt_Interval)


    var allCombinations = []

    uniqueGenres.forEach(
        g => {
            uniqueYears.forEach(
                t => {
                    var hasElement = GroupedDataCnt.some(d => d.release_year === t && d.genres === g);
                    if (hasElement === false) {
                        return GroupedDataCnt.push({genres: g, release_year: t, count: 0})
                    }

                    // allCombinations.push({genres: g, release_year: t, count : 0})
                }
            )
        }
    )


    GroupedDataCnt.sort((a, b) => a.release_year - b.release_year);
    // console.log(GroupedDataCnt)
    // console.log(GroupedDataCnt_Interval.filter(d=>d.release_year == '1949'))
    // // There isn't any data from 1949 to 1953 in our dataset


    let series = d3.stack()
        .offset(d3.stackOffsetExpand)
        .keys(d3.union(GroupedDataCnt_Interval.map(d => d.genres))) // distinct series keys, in input order
        .value(function ([, D], key) {
                // console.log(key, D.get(key))
                return D.get(key).count
            }
        ) // get value for each series key and stack
        (d3.index(GroupedDataCnt_Interval, d => d.release_year, d => d.genres)); // group by stack then series key

    // console.log(series)


// console.log(x_scale("sport"))

    let x = d3.scaleUtc()
        .domain(d3.extent(GroupedDataCnt_Interval, d => d.release_year))
        .range([1.5 * margin, w + 1.5 * margin])
    ;

    let y = d3.scaleLinear()
        .rangeRound([h, margin]);

    let customColors = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7", "#ea5545", "#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4"];


    let color = d3.scaleOrdinal()
        .domain(series.map(d => d.key))
        .range(customColors)

    // .range(schemeCategory10);


    // let yearDate = new Date(yearString, 0); // The second parameter (month) is set to 0, as months are zero-indexed in JavaScript


    // letruct an area shape.
    let area = d3.area()
        .x(function (d) {
                // console.log(d.data[0],x(d.data[0]))

                return x(d.data[0])
            }
        )
        .y0(function (d) {
            // console.log(d[0],d[1],y(d[0]),y(d[1]))
            return y(d[0])
        })
        .y1(d => y(d[1]))
        .defined(d => d[0] !== null && d[1] !== null);


    svg.selectAll("#barG_GenreByTime").append("g")
        .selectAll("path")
        .data(series)
        .join("path")
        .attr("class", "genrebytime_path")
        .attr("fill", d => color(d.key))
        .attr("d", area)
        .style("opacity", 0.5)
        .append("title")
        .text(function (d) {
            return d.key
        });


// // add axis

    svg.select("#bkgG_GenreByTime").append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x));


    svg.select("#bkgG_GenreByTime").append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${1.5 * margin},0)`)
        .call(d3.axisLeft(y).ticks(10, "%"))
        .call(g => g.select(".domain").remove());


//       // // Add labels to the axes.
    svg.select("#bkgG_GenreByTime").append("text")
        .attr("class", "x-label")
        .attr("x", margin + w / 2)
        .attr("y", h + margin * 0.8)
        .text("Year");

    svg.select("#bkgG_GenreByTime").append("text")
        .attr("class", "y-label")
        .attr("transform", `translate(${0.5 * margin},${margin + h / 2}),rotate(-90)`)
        .text("Percentage");

    // tooltip
    let tooltip = svg.select("#barG")
        .append("div")
        .attr("class", "svg-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 25 + ")";
        });

    legend.append("rect")
        .attr("x", w + 2.2 * margin - 18)
        .attr("y", 30)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .style("opacity", 0.5);

    legend.append("text")

        .attr("x", w + 3 * margin - 24)
        .attr("y", 35)
        .attr("dy", ".6em")
        .style("text-anchor", "start")
        .style("font-size", "8pt")
        .text(function (d) {
            return d;
        });


    svg.select("#barG_GenreByTime")
        .selectAll(".genrebytime_path")
        .on("mouseover", function (event, d) {// change the selection style

            d3.select(this)
                .style("opacity", 1)
                .attr('stroke-width', '2')
                .attr("stroke", "black");
            // make the tooltip visible and update its text
            tooltip.style("visibility", "visible");

        })
        .on("mousemove", function (event, d) {
        })
        .on("mouseout", function () {// change the selection style
            d3.select(this).attr('stroke-width', '0')
                .style("opacity", 0.5);
            tooltip.style("visibility", "hidden");
        });

}

// network of genre
function process_unique_genre(Data) {
    let selectedData = Data.map(function (d) {
        return {id: d["id"], genres: d["genres"]};
    }); // only keep genres
    // console.log(selectedData,Data)

    let GenreArray = []
    var parsedData = selectedData.map(function (str) {
        d = JSON.parse(str["genres"].replace(/'/g, "\""))
        // let t = str["release_year"]
        d.forEach(element => {
            GenreArray.push({genres: element})
        });
    });
    var uniqueGenres = Array.from(new Set(GenreArray.map(d => d.genres)));
    return uniqueGenres
}

function process_genre_net_data(Data) {
    let selectedData = Data.map(function (d) {
        return {id: d["id"], genres: d["genres"]};
    }); // only keep genres
    // console.log(selectedData,Data)

    let GenreArray = []
    var parsedData = selectedData.map(function (str) {
        d = JSON.parse(str["genres"].replace(/'/g, "\""))
        // let t = str["release_year"]
        d.forEach(element => {
            GenreArray.push({genres: element})
        });
    });
    var uniqueGenres = Array.from(new Set(GenreArray.map(d => d.genres)));
    let nodes = []
    uniqueGenres.forEach(
        function (d) {
            nodes.push({id: d})
        }
    )
    // console.log("nodes",nodes)

    selectedData.forEach(movie => {
        movie.genres = JSON.parse(movie.genres.replace(/'/g, '"'));
    });

    // Now the genres property is an array for each movie
    // console.log("selectedData",selectedData);

    var links = [];

    function createLinks(genres) {
        // console.log(genres)
        for (var i = 0; i < genres.length - 1; i++) {
            for (var j = i + 1; j < genres.length; j++) {
                // Check if the link already exists
                var existingLink = links.find(link => (link.source === genres[i] && link.target === genres[j]) ||
                    (link.source === genres[j] && link.target === genres[i]));

                if (existingLink) {
                    // Increment the count if the link exists
                    existingLink.count += 1;
                } else {
                    // Create a new link if it doesn't exist
                    links.push({source: genres[i], target: genres[j], count: 1});
                }
            }
        }
    }

    selectedData.forEach(d => {
        // console.log(d)
        createLinks(d.genres);
    });

    // console.log(links)
    data = {nodes: nodes, links: links}
    // data.push({nodes:nodes})
    // data.push({links:links})
    // console.log(data)
    return data
}


function initSVGcanvas_GenreNet(Data) {
    // scales to compute (x,y) coordinates from data values to SVG canvas
    // creating the SVG canvas 
    let h = 500
    let w = 610
    let margin = 40
    let innerRadius = Math.min(w, h) * 0.5 - 20;
    let outerRadius = innerRadius + 6;
    let svg = d3.select("#GenreNet")
        .append("svg")
        .attr("id", "svg_GenreNet")
        .attr("width", w)
        .attr("height", h);


    // let rootG = svg.append("g").attr("id", "rootG_GenreNet");
    //     rootG.append("g").attr("id", "bkgG_GenreNet");
    //     rootG.append("g").attr("id", "barG_GenreNet");


    let Net_data = process_genre_net_data(Data)
    let names = process_unique_genre(Data)
    // console.log(Net_data,uniqueGenres)

    let links = Net_data.links.map(d => ({...d}));
    let nodes = Net_data.nodes.map(d => ({...d}));
    let index = new Map(names.map((name, i) => [name, i]));
    // console.log(index)
    let matrix = Array.from(index, () => new Array(names.length).fill(0));
    for (let {source, target, count} of links) {
        // console.log(source, target, count)
        matrix[index.get(source)][index.get(target)] += count
    }
    ;

    // console.log(matrix)
    function findKeyByValue(map, value) {
        for (let [key, val] of map) {
            if (val === value) {
                return key;
            }
        }
        return undefined; // Return undefined if value is not found
    }

    // let  keyForResult = findKeyByValue(dataset, valueToFind)
    // console.log(findKeyByValue(index,1) )


    let customColors = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7", "#ea5545", "#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4"];
    let colors = d3.scaleOrdinal()
        .domain(names)
        .range(customColors)
// // directed
//     let chord = d3.chordDirected()
//             .padAngle(12 / innerRadius)
//             .sortSubgroups(d3.descending)
//             .sortChords(d3.descending);
//undirected
    let chord = d3.chord()
        .padAngle(20 / innerRadius)
        .sortSubgroups(d3.descending);

    let arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    let ribbon = d3.ribbonArrow()
        .radius(innerRadius - 0.5)
        .padAngle(1 / innerRadius);
    let formatValue = x => `${x.toFixed(0)}`;
    let chords = chord(matrix);

    let textId = names.map((d, i) => 'path-' + i);
    // console.log(textId[i])
    svg.append("path")

        .attr("fill", "none")
        .attr("d", d3.arc()({outerRadius, startAngle: 0, endAngle: 2 * Math.PI}));

    svg.append("g")
        .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')')
        .attr("fill-opacity", 0.55)
        .selectAll()
        .data(chords)
        .join("path")

        .attr("d", ribbon)
        // .attr("fill", d => colors[d.target.index])
        .attr("fill", "grey")
        .style("mix-blend-mode", "multiply")
        .append("title")
        .text(function (d) {
                return `${names[d.source.index]} and ${names[d.target.index]} ${formatValue(d.source.value)}`
            }
        );

    const g = svg.append("g")
        .selectAll()
        .data(chords.groups)
        .join("g")
        .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')'); // Center the chord diagram
    ;

    g.append("path")
        .attr("d", arc)
        .attr("id", (d, i) => textId[i])
        .attr("fill",
            function (d) {
                // console.log(d)

                return colors(findKeyByValue(index, d.index))
            }
        )
        .attr("stroke", d => (colors(findKeyByValue(index, d.index))));

    // g.append("text")
    // .attr("x",d=>arc.centroid(d)[0])
    // .attr("y",d=>arc.centroid(d)[1] )
    //     .attr("dy", -3)
    //   .append("textPath")
    //     // .attr("xlink:href", (d,i)=>`#${textId[i]}`)
    //     .attr("startOffset", d => d.startAngle * outerRadius)
    //     .text(function(d){
    //       // console.log(arc.centroid(d))
    //       // console.log(findKeyByValue(index,d.index))
    //       return findKeyByValue(index,d.index)
    //     })

    // .text(d => names[d.index]);

    g.append("title")
        .text(d => `${names[d.index]}`);

    g.append("text")
        .attr("x", function (d) {
                if (arc.centroid(d)[0] >= 0) {
                    return arc.centroid(d)[0] + 10
                } else {
                    return arc.centroid(d)[0] - 10
                }

            }
        )
        .attr("y", d => arc.centroid(d)[1])
        .style("text-anchor", function (d) {
                if (arc.centroid(d)[0] >= 0) {
                    return "start"
                } else {
                    return "end"
                }
            }
        )
        .style("font-size", "8pt")
        .text(d => `${names[d.index]}`);


}

function initSVGcanvas_hist_CountCountry(Data) {
    let h = 500
    let w = 500
    let margin = 40
    let barColor = "#00bfa0"
    // scales to compute (x,y) coordinates from data values to SVG canvas
    // creating the SVG canvas
    let svg = d3.select("#histogram_CountCountry")
        .append("svg")
        .attr("id", "hist_cat")
        .attr("width", w + margin)
        .attr("height", h);


    let countBycountry = d3.rollups(Data, v => v.length, d => d.production_countries)
    // Now you have your categoryData in the desired format
    // console.log( countBycountry );
    // Initialize an array to hold the separated data
    let aggregatedData = {};

// Iterate through each entry in the raw data
    countBycountry.forEach(entry => {
        // Get the keys (categories) and value from the entry
        let keys = entry[0]; // There's only one key in each entry
        let value = entry[1];
        let regex = /'|\[|\]| /g;
        // console.log(keys)

        let preprocessedKeys = keys.replace(regex, '');

        // Parse the keys to obtain the list of categories
        let categories = preprocessedKeys.split(',');

        // console.log(preprocessedKeys)
        // Parse the keys to obtain the list of categories
//   let categories = JSON.parse(preprocessedKeys);
//   console.log(categories)
        // Create a new entry for each category
        categories.forEach(category => {
            if (aggregatedData[category] === undefined) {
                aggregatedData[category] = value;
            } else {
                aggregatedData[category] += value;
            }
        });

    });

    // console.log(aggregatedData);

    let rootG = svg.append("g").attr("id", "rootG_country");
    rootG.append("g").attr("id", "bkgG_country");
    rootG.append("g").attr("id", "barG_country");

    // processing genres data

    // release_year [1945,2022]
    let yearsData = Data.map(d => d["release_year"])
    let yearsExt = d3.extent(yearsData) // d3.extent(years)[0]=1945, d3.extent(years)[1]=2022


    // select by year
    // let selectedData = Data.filter(function(d) { return d.release_year === '2022'; }).map(d => d["genres"]);
    let selectedData = Data.map(d => d["genres"]); // all the data in all the years
    var parsedData = selectedData.map(function (str) {
        return JSON.parse(str.replace(/'/g, "\""));
    });
    let flattenedData = d3.merge(parsedData);

    // console.log(flattenedData)
    // console.log(`Number of entries in dataset: ${selectedData.length},total number of genre labels in dataset: ${flattenedData.length}`)
    let counts = d3.rollups(flattenedData, d => d.length, d => d); //this is an array
    let counts_genre_total = {} //this is a fictionary
    counts.forEach(function (item) {
        counts_genre_total[item[0]] = item[1];
    });

    // console.log(counts_genre_total)

    if (aggregatedData.hasOwnProperty("")) {
        // Delete the item with the specified key
        delete aggregatedData[""];

        // console.log('Item with empty key ' + "" + ' deleted.');
    }

    // Sort the data in descending order based on the 'value' property
    var dataArray = Object.keys(aggregatedData).map(function (key) {
        return {key: key, value: aggregatedData[key]};
    });
    dataArray.sort(function (a, b) {
        return b.value - a.value;
    });

    // Keep only the top 30 items

    let K = 30
    var topKData = dataArray.slice(0, K);
    // console.log(topKData)

    let data = Object.entries(topKData);


    // let values = Object.values(topKData)
    // console.log(`values ${values}`)
    // let maxValue = d3.max(values);
    let y_scale = d3.scaleLinear() //the counts
        .domain([0, d3.max(data, function (d) {
            return d[1].value;
        })]).nice()
        .range([h * 0.75 + margin, margin])


    // let keys = Object.keys(topKData)
    // let x_scale = d3.scaleBand()
    //                 .domain(keys)
    //                 .range([margin*2, w])
    //                 .padding(0.1)
    let x_scale = d3.scaleBand()
        .domain(data.map(function (d) {
            return d[1].key;
        }))
        .range([margin * 2, w])
        .padding(0.1);


// console.log(x_scale("sport"))
    svg.selectAll("#barG_country").selectAll(".bar_country")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar_country")
        .attr("fill", barColor)
        .attr("x", function (d) {
            return x_scale(d[1].key);
        })
        .attr("y", function (d) {
            //  console.log(d[1])
            return y_scale(d[1].value);
        })
        .attr("width", x_scale.bandwidth())
        .attr("height", d => margin + h * 0.75 - y_scale(d[1].value));


// add axis
    svg.select("#bkgG_country").append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${0},${margin + h * 0.75 + 5})`)
        .call(d3.axisBottom(x_scale))
        .selectAll("text")
        .style("text-anchor", "end") // Set text-anchor to the end (right)
        .attr("dx", "-0.3em") // Adjust the x-offset for the text
        .attr("dy", "0.15em") // Adjust the y-offset for the text
        .attr("transform", "rotate(-45)")
    ;

    svg.select("#bkgG_country").append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin * 2},${0})`)
        .call(d3.axisLeft(y_scale));

    // // Add labels to the axes.
    svg.select("#bkgG_country").append("text")
        .attr("class", "x-label")
        .attr("x", w / 2)
        .attr("y", h - margin * 0.8)
        .text("Country");

    svg.select("#bkgG_country").append("text")
        .attr("class", "y-label")
        .attr("transform", `translate(${margin * 0.8},${margin / 2 + h / 2}),rotate(-90)`)
        .text("Count");

    // tooltip
    let tooltip = svg.select("#barG_country")
        .append("div")
        .attr("class", "svg-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

// select all rect
    svg.select("#barG_country").selectAll(".bar_country")
        .on("mouseover", function (event, d) {// change the selection style
            // console.log(d[1].key,d[1].value)
            d3.select(this)
                .append("title")
                .text((d) => (` Country: ${d[1].key}\n Count : ${d[1].value}\n`))
                .attr('stroke-width', '2')
                .attr("stroke", "black");
            // make the tooltip visible and update its text
            tooltip.style("visibility", "visible");


        })
        .on("mousemove", function (event, d) {
            // console.log(event.pageX,event.pageY)
            tooltip
                .style("top", `${event.pageY - 10} px`)
                .style("left", `${event.pageX + 10} px`);
        })
        .on("mouseout", function () {// change the selection style
            d3.select(this).attr('stroke-width', '0');
            tooltip.style("visibility", "hidden");
        });

}

// correlation
function initSVGcanvas_corr(Data) {
    let w = 500
    let h = 500
    let margin = 40

    // scales to compute (x,y) coordinates from data values to SVG canvas
    // creating the SVG canvas 
    let svg = d3.select("#correlation")
        .append("svg")
        .attr("id", "correlaton_svg")
        .attr("width", w + margin)
        .attr("height", h + margin);

    let rootG = svg.append("g").attr("id", "rootG_corr");
    rootG.append("g").attr("id", "bkgG_corr");
    rootG.append("g").attr("id", "cellG_corr");

    // processing  data
    // release_year [1945,2022]
    // let yearsData = Data.map(d=>d["release_year"]) 
    // let yearsExt = d3.extent(yearsData) // d3.extent(years)[0]=1945, d3.extent(years)[1]=2022

    let selectedAttributes = ["release_year", "runtime", "imdb_score", "tmdb_score", "tmdb_popularity", "imdb_votes"];
    let selectedData2 = Data.map(function (d) {
        var selectedEntry = {};
        selectedAttributes.forEach(function (attribute) {
            selectedEntry[attribute] = d[attribute];
        });
        return selectedEntry;
    });
    let filteredData = selectedData2.filter(function (d) {
        return d.release_year !== '' &&
            d.runtime !== '' &&
            d.imdb_score !== '' &&
            d.tmdb_score !== '' &&
            d.tmdb_popularity !== '' &&
            d.imdb_votes !== '';
    });


    // console.log(filteredData)

    let convertedData = {};

    for (var attribute in selectedAttributes) {
        attr = selectedAttributes[attribute]
        // console.log(attr)
        convertedData[attr] = filteredData.map(function (d) {
            return parseFloat(d[attr]);
        });

    }

    // console.log(convertedData)


    const keys = Object.keys(convertedData);
    const correlations = {};

    for (let i = 0; i < keys.length; i++) {
        for (let j = i; j < keys.length; j++) {
            const key1 = keys[i];
            const key2 = keys[j];

            const sumX = convertedData[key1].reduce((acc, value) => acc + value, 0);
            const sumY = convertedData[key2].reduce((acc, value) => acc + value, 0);
            const sumXY = convertedData[key1].reduce((acc, value, index) => acc + value * convertedData[key2][index], 0);
            const sumX2 = convertedData[key1].reduce((acc, value) => acc + value ** 2, 0);
            const sumY2 = convertedData[key2].reduce((acc, value) => acc + value ** 2, 0);
            const n = convertedData[key1].length;

            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
            const correlation = numerator / denominator;

            correlations[`${key1}-${key2}`] = correlation;
        }
    }
    // console.log(correlations)
    //   console.log(keys.flatMap(key1 => keys.map(key2 => ({ key1, key2, value: correlations[`${key1}-${key2}`] }))))

    let gridSize = (w - 2 * margin) / keys.length;

    //   const colors = d3.schemeRdBu.map(color => color === null ? 'white' : color);

    // console.log(correlations)

    // let colors = d3.scaleQuantize().domain([-0.8,0.8]).range(d3.schemeRdBu[11].reverse());
    // Use d3.schemeRdBu[11].reverse() as the range
    let colors = d3.scaleQuantize()
        .domain([-0.8, 0.76])  // Including 0 and 1 in the domain
        .range(d3.schemeRdBu[11].reverse());
    // let colors_blue = d3.scaleQuantize().domain([-0.8,0]).range(d3.schemeBlues[10])


    // Override the color for the value 1 with "darkred"
    // colors.range()[colors.domain().indexOf(1)] = "white";


    let heatmap = svg.select("#cellG_corr").selectAll(".cell")
        .data(keys.flatMap(key1 => keys.map(key2 => ({key1, key2, value: correlations[`${key1}-${key2}`]}))))
        .enter()
        .append("rect")
        .attr("x", d => keys.indexOf(d.key2) * gridSize)
        .attr("y", d => keys.indexOf(d.key1) * gridSize)
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", function (d) {
                // console.log(d.value)
                if (typeof d.value == 'undefined') {
                    return "white";
                } else if (d.value == 1) {
                    return "maroon";
                } else {
                    return colors(d.value);
                }
                // else{return colors_blue(d.value)}
            }
        )
        .attr("stroke", "white")
        .attr("transform", `translate(${1 * margin},${2 * margin})`);

    let xAxis = svg.select("#bkgG_corr")
        .append("g")
        .attr("class", "x-axis") //bkgG_corr
        .attr("transform", `translate(${0},${2 * margin})`)
        .call(d3.axisTop().scale(d3.scaleBand().domain(keys).range([1 * margin, w - margin])))
    ;

    let yAxis = svg.select("#bkgG_corr")
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${w - margin},${0})`)
        .call(d3.axisRight().scale(d3.scaleBand().domain(keys).range([2 * margin, h])))
    //   .selectAll("text")
    // .style("text-anchor", "end") // Set text-anchor to the end (right)
    // .attr("dx", "-0.3em") // Adjust the x-offset for the text
    // .attr("dy", "0.15em") // Adjust the y-offset for the text
    // .attr("transform", "rotate(-90)");
    //legend
    let value_For_Legend = [-1, -0.6, -0.3, 0, 0.3, 0.6, 1]
    let legend_square_size = 25
    let legend = svg.select("#bkgG_corr").append("g").attr('id', "legend_heatmap");

    function color_filled(d) {
        if (d == 1) {
            return "maroon";
        } else if (d == -1) {
            return "darkblue"
        } else {
            return colors(d);
        }
    }

    function translate_Text(i) {
        return `translate(${legend_square_size + i * legend_square_size},${h - legend_square_size})`
    }

    value_For_Legend.forEach(function (d, i) {
        // console.log(d,i)
        legend.append('rect')
            .attr('x', margin + i * legend_square_size) // Adjust spacing as needed
            .attr('y', 35)
            .attr('width', legend_square_size)
            .attr('height', legend_square_size)
            .style('fill', color_filled(d))

    })

    // svg.attr('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);

    legend.append('text')
        .text("-1")
        .attr('x', margin).attr('y', 30)
        .style('fill', 'black').style("text-anchor", "start").style("font-size", "10pt")
    legend.append('text')
        .text("0")
        .attr('x', 125).attr('y', 30)
        .style('fill', 'black').style("text-anchor", "middle").style("font-size", "10pt")

    legend.append('text')
        .text("+1")
        .attr('x', 200).attr('y', 30)
        .style('fill', 'black').style("text-anchor", "middle").style("font-size", "10pt")

    legend.append('text')
        .text("Correlations")
        .attr('x', 250).attr('y', 530)
        .style('fill', 'black').style("text-anchor", "middle").style("font-size", "10pt")


    // tooltip
    let tooltip = svg.select("#cellG_corr")
        .append("div")
        .attr("class", "svg-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    // select all rect
    // svg.select("#cellG_corr").selectAll(".cell")
    heatmap
        .on("mouseover", function (event, d) {// change the selection style
            // console.log(d.length)
            d3.select(this)
                .append("title")
                .attr('stroke-width', '2')
                .attr("stroke", "black")
                .text(
                    function (d) {
                        let coor = "Positive"
                        if (d.value < 0) {
                            let coor = "Negative"
                            return `${coor} correlation\n ${d.key1} - ${d.key2} :\n ${d3.format('.2f')(d.value)}`
                        }

                        return `${coor} correlation\n ${d.key1} - ${d.key2} :\n ${d3.format('.2f')(d.value)}`
                    }
                    // (d) => (`${coor} correlation\n ${d.key1} - ${d.key2} :\n ${d3.format('.2f')(d.value)}`)
                )
            ;
            // make the tooltip visible and update its text
            tooltip.style("visibility", "visible");


        })
        .on("mousemove", function (event, d) {
            // console.log(event.pageX,event.pageY)
            tooltip
                .style("top", `${event.pageY - 10} px`)
                .style("left", `${event.pageX + 10} px`);
        })
        .on("mouseout", function () {// change the selection style
            d3.select(this).attr('stroke-width', '2');
            tooltip.style("visibility", "hidden");
        });

}

function createVizWen() {
    loadDataWen();
};


function loadDataWen() {
    console.log("loading data by Wen ...");
    d3.csv("./data/titles.csv").then(function (d) {
        console.log(`Processing ${d.length} entries`);

        initSVGcanvas_hist_numeric(d);
        Select_Show_Movie()
        initSVGcanvas_hist_cat(d);
        initSVGcanvas_treemap_genres(d);
        initSVGcanvas_GenreByTime(d);
        initSVGcanvas_GenreNet(d);
        initSVGcanvas_hist_CountCountry(d);
        initSVGcanvas_corr(d);

    }).catch(function (error) {
        console.log(error)
    });
};
