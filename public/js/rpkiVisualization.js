document.addEventListener('DOMContentLoaded', function() {
  const width = 960;
  const height = 600;

  // Change the selection to target specific containers for each visualization
  const mapSvg = d3.select(".visualization-container.map").append("svg")
    .attr("width", width)
    .attr("height", height);

  const path = d3.geoPath();

  // Define a color scale using D3's scaleSequential and interpolateReds for a red color gradient
  const invalidStatusColorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0, 100]); // Set the domain from 0 (less invalid) to 100 (more invalid)

  const tooltip = d3.select("#tooltip");

  // Define zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      mapSvg.selectAll('path').attr('transform', event.transform);
    });

  mapSvg.call(zoom);

  let zoomedStateId = null; // Track the last clicked state ID

  // Placeholder data for state names and invalid RPKI status
  const stateData = [
    { state: 'California', invalidStatus: 50 },
    { state: 'New York', invalidStatus: 75 },
    // ... rest of the state data
  ]; 

  // Retrieve the current theme from local storage or set default as 'light'
  let currentTheme = localStorage.getItem('theme') || 'light';

  // Function to update stroke based on theme
  function updateStrokeColor() {
    currentTheme = localStorage.getItem('theme') || 'light';
    mapSvg.selectAll('.state-borders')
      .attr('stroke', currentTheme === 'dark' ? '#343A40' : '#000');
  }

  // Listen for theme changes to adjust stroke color
  const darkModeToggle = document.getElementById('darkModeToggle');
  if(darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      updateStrokeColor();
    });
  }

  // Load and display the map
  d3.json("https://d3js.org/us-10m.v1.json").then(function(us) {
    mapSvg.append("g")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .join("path")
      .attr("fill", d => invalidStatusColorScale(Math.random() * 100)) // Use the invalidStatusColorScale for fill color
      .attr("d", path)
      .on("mouseover", function(event, d) {
        d3.select(this).style("fill", "pink");
        const stateInfo = stateData.find(s => s.state === d.properties.name);
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${stateInfo ? `${stateInfo.state}: Invalid Status ${stateInfo.invalidStatus}%` : 'State data not available'}`) // Display state name and invalid status
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).style("fill", d => invalidStatusColorScale(Math.random() * 100)); // Reset fill color using the scale
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click", function(event, d) {
        if (zoomedStateId === d.id) { // If the same state is clicked again, zoom out
          mapSvg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity); // Reset zoom
          zoomedStateId = null; // Reset zoomed state ID
        } else {
          const [x, y] = path.centroid(d);
          mapSvg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(5).translate(-x, -y)); // Adjusted scale to 5 for reduced zoom
          zoomedStateId = d.id; // Update zoomed state ID
        }
      });

    // Add state borders with initial stroke color based on theme
    mapSvg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "state-borders")
        .attr("d", path)
        .attr('stroke', currentTheme === 'dark' ? '#343A40' : '#000');

    // Ensure stroke color is updated on page load based on the initial theme
    updateStrokeColor();
  }).catch(function(error) {
    console.error('Error loading US map data:', error.message);
    console.error(error.stack);
  });

  // Load RPKI data
  d3.json('/data/rpkiDummyData.json').then(function(data) {
    console.log('Loaded RPKI dummy data:', data);
    // Logic to update the map based on RPKI data
  }).catch(function(error) {
    console.error('Error loading RPKI dummy data:', error.message);
    console.error(error.stack);
  });

  function addMapLegend(svg, colorScale) {
    const legendWidth = 300;
    const legendHeight = 20;
    const numSegments = 10; // Number of segments in the gradient legend

    const legend = svg.append("g")
      .attr("id", "mapLegend")
      .attr("transform", `translate(20, ${svg.attr("height") - 40})`); // Positioning the legend at the bottom left

    const legendScale = d3.scaleLinear()
      .domain([0, numSegments - 1])
      .range([0, legendWidth]);

    legend.selectAll("rect")
      .data(d3.range(numSegments))
      .enter().append("rect")
        .attr("x", d => legendScale(d))
        .attr("y", 0)
        .attr("width", legendWidth / numSegments)
        .attr("height", legendHeight)
        .attr("fill", (d, i) => colorScale(i / (numSegments - 1) * 100));

    // Adding a scale to indicate the invalid RPKI status values
    const legendAxis = d3.axisBottom(legendScale)
      .tickSize(13)
      .tickValues(d3.range(numSegments))
      .tickFormat(i => Math.round(i / (numSegments - 1) * 100));

    legend.call(legendAxis)
      .select(".domain")
      .remove(); // Remove the domain path to clean up the appearance

    legend.append("text")
      .attr("class", "legend-title")
      .attr("x", legendWidth / 2)
      .attr("y", -6)
      .attr("text-anchor", "middle")
      .text("Invalid RPKI Status (%)");
  }

  // Call the addMapLegend function after the map and its features are fully loaded and rendered
  addMapLegend(mapSvg, invalidStatusColorScale);
    

  // Function to draw the pie chart
  function drawPieChart(data) {
    const pieWidth = 450;
    const pieHeight = 450;
    const margin = 40;

    const radius = Math.min(pieWidth, pieHeight) / 2 - margin;
    const expandedRadius = radius + 10; // Increased radius for hover effect

    const pieSvg = d3.select(".visualization-container.pie-chart")
      .append("svg")
      .attr("width", pieWidth)
      .attr("height", pieHeight)
      .append("g")
      .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.status))
      .range(d3.schemeSet2);

    const pie = d3.pie()
      .value(d => d.value);

    const data_ready = pie(data);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(expandedRadius);

    pieSvg
      .selectAll('pieces')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.status))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover);
        tooltip.html(`${d.data.status}: ${d.data.value}`)
          .style("opacity", 1)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
        tooltip.style("opacity", 0);
      });

    pieSvg
      .selectAll('labels')
      .data(data_ready)
      .join('text')
      .text(d => d.data.status)
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", 15);
  }

  // Adjusted dummy data for the pie chart to an array of objects
  const dummyData = [
    { status: "Valid", value: 10 },
    { status: "Invalid", value: 2 },
    { status: "Unknown", value: 3 }
  ];

  // Call the drawPieChart function with adjusted dummy data
  drawPieChart(dummyData);

  // Function to draw the line chart
  function drawLineChart(data) {
    const lineMargin = { top: 20, right: 20, bottom: 30, left: 50 },
        lineWidth = 960 - lineMargin.left - lineMargin.right,
        lineHeight = 500 - lineMargin.top - lineMargin.bottom;

    const lineSvg = d3.select(".visualization-container.line-chart").append("svg")
        .attr("width", lineWidth + lineMargin.left + lineMargin.right)
        .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
      .append("g")
        .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");

    const x = d3.scaleTime().range([0, lineWidth]).domain([new Date(1970, 0, 1), new Date(2024, 11, 31)]);
    const y = d3.scaleLinear().range([lineHeight, 0]);

    const line = d3.line()
        .curve(d3.curveBasis) // Make the lines more swirly
        .x(function(d) { return x(d.time); })
        .y(function(d) { return y(d.percentage); });

    x.domain(d3.extent(data, function(d) { return d.time; }));
    y.domain([0, d3.max(data, function(d) { return d.percentage; })]);

    lineSvg.append("g")
        .attr("transform", "translate(0," + lineHeight + ")")
        .call(d3.axisBottom(x));

    lineSvg.append("g")
        .call(d3.axisLeft(y));

    const statusCategories = ['Valid', 'Invalid', 'Unknown'];

    statusCategories.forEach(function(status) {
      const dataFiltered = data.filter(d => d.status === status);

      lineSvg.append("path")
        .data([dataFiltered])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", function() {
          if (status === 'Valid') return "green";
          if (status === 'Invalid') return "red";
          if (status === 'Unknown') return "gray";
        });
    });

    // Add legend
    const legend = lineSvg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(statusCategories.slice().reverse())
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", lineWidth - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", function(d) {
        if (d === 'Valid') return "green";
        if (d === 'Invalid') return "red";
        if (d === 'Unknown') return "gray";
      });

    legend.append("text")
      .attr("x", lineWidth - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

    // Tooltip for line chart
    const focus = lineSvg.append("g")
      .style("display", "none");

    focus.append("circle")
      .attr("r", 4.5);

    focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

    lineSvg.append("rect")
      .attr("class", "overlay")
      .attr("width", lineWidth)
      .attr("height", lineHeight)
      .style("opacity", 0)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

    function mousemove(event) {
      const x0 = x.invert(d3.pointer(event, this)[0]),
            i = d3.bisector(function(d) { return d.time; }).left(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.time > d1.time - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d.time) + "," + y(d.percentage) + ")");
      focus.select("text").text(function() { return d.percentage; });
      tooltip.html(`Time: ${d.time.getFullYear()} <br> Percentage: ${d.percentage}%`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 15) + "px")
        .style("opacity", 1);
    }
  }

  // Dummy data for the line chart
  const dummyLineChartData = [
    { time: new Date(1970, 0, 1), percentage: 20, status: 'Valid' },
    { time: new Date(1971, 0, 1), percentage: 25, status: 'Valid' },
    { time: new Date(1972, 0, 1), percentage: 30, status: 'Invalid' },
    { time: new Date(1973, 0, 1), percentage: 35, status: 'Unknown' },
    {time: new Date(1974, 0, 1), percentage: 40, status: 'Valid'},
    { time: new Date(1975, 0, 1), percentage: 45, status: 'Valid' },
    { time: new Date(1976, 0, 1), percentage: 50, status: 'Invalid' },
    { time: new Date(1977, 0, 1), percentage: 55, status: 'Unknown' },
    { time: new Date(1978, 0, 1), percentage: 60, status: 'Valid' },
    { time: new Date(1979, 0, 1), percentage: 65, status: 'Invalid' },
    { time: new Date(1980, 0, 1), percentage: 70, status: 'Unknown' },
    { time: new Date(1981, 0, 1), percentage: 75, status: 'Valid' },
    { time: new Date(1982, 0, 1), percentage: 80, status: 'Invalid' },
    { time: new Date(1983, 0, 1), percentage: 85, status: 'Unknown' },
    { time: new Date(1984, 0, 1), percentage: 90, status: 'Valid' },
    { time: new Date(1985, 0, 1), percentage: 95, status: 'Invalid' },
    { time: new Date(1986, 0, 1), percentage: 100, status: 'Unknown' },
    { time: new Date(1987, 0, 1), percentage: 95, status: 'Valid' },
    { time: new Date(1988, 0, 1), percentage: 90, status: 'Invalid' },
    { time: new Date(1989, 0, 1), percentage: 85, status: 'Unknown' },
    { time: new Date(1990, 0, 1), percentage: 80, status: 'Valid' },
    { time: new Date(1991, 0, 1), percentage: 75, status: 'Invalid' },
    { time: new Date(1992, 0, 1), percentage: 70, status: 'Unknown' },
    { time: new Date(1993, 0, 1), percentage: 65, status: 'Valid' },
    { time: new Date(1994, 0, 1), percentage: 60, status: 'Invalid' },
    { time: new Date(1995, 0, 1), percentage: 55, status: 'Unknown' },
    { time: new Date(1996, 0, 1), percentage: 50, status: 'Valid' },
    { time: new Date(1997, 0, 1), percentage: 45, status: 'Invalid' },
    { time: new Date(1998, 0, 1), percentage: 40, status: 'Unknown' },
    { time: new Date(1999, 0, 1), percentage: 35, status: 'Valid' },
    { time: new Date(2000, 0, 1), percentage: 30, status: 'Invalid' },
    { time: new Date(2001, 0, 1), percentage: 25, status: 'Unknown' },
    { time: new Date(2002, 0, 1), percentage: 20, status: 'Valid' },
    { time: new Date(2003, 0, 1), percentage: 15, status: 'Invalid' },
    { time: new Date(2004, 0, 1), percentage: 10, status: 'Unknown' },
    { time: new Date(2005, 0, 1), percentage: 5, status: 'Valid' },
    { time: new Date(2006, 0, 1), percentage: 10, status: 'Invalid' },
    { time: new Date(2007, 0, 1), percentage: 15, status: 'Unknown' },
    { time: new Date(2008, 0, 1), percentage: 20, status: 'Valid' },
    { time: new Date(2009, 0, 1), percentage: 25, status: 'Invalid' },
    { time: new Date(2010, 0, 1), percentage: 30, status: 'Unknown' },
    { time: new Date(2011, 0, 1), percentage: 35, status: 'Valid' },
    { time: new Date(2012, 0, 1), percentage: 40, status: 'Invalid' },
    { time: new Date(2013, 0, 1), percentage: 45, status: 'Unknown' },
    { time: new Date(2014, 0, 1), percentage: 50, status: 'Valid' },
    { time: new Date(2015, 0, 1), percentage: 55, status: 'Invalid' },
    { time: new Date(2016, 0, 1), percentage: 60, status: 'Unknown' },
    { time: new Date(2017, 0, 1), percentage: 65, status: 'Valid' },
    { time: new Date(2018, 0, 1), percentage: 70, status: 'Invalid' },
    { time: new Date(2019, 0, 1), percentage: 75, status: 'Unknown' },
    { time: new Date(2020, 0, 1), percentage: 80, status: 'Valid' },
    { time: new Date(2021, 0, 1), percentage: 85, status: 'Invalid' },
    { time: new Date(2022, 0, 1), percentage: 90, status: 'Unknown' },
    { time: new Date(2023, 0, 1), percentage: 95, status: 'Valid' },
    { time: new Date(2024, 0, 1), percentage: 100, status: 'Invalid' },
    { time: new Date(2024, 11, 31), percentage: 60, status: 'Valid' },
    { time: new Date(2024, 11, 31), percentage: 55, status: 'Invalid' },
    { time: new Date(2024, 11, 31), percentage: 50, status: 'Unknown' }
  ];

  // Parse the date / time
  dummyLineChartData.forEach(function(d) {
    d.time = new Date(d.time);
  });

  // Call the function with the dummy data
  drawLineChart(dummyLineChartData);

  // Automatically apply filters when search input or filter dropdown changes
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('searchFilter').addEventListener('change', applyFilters);

  function applyFilters() {
    const searchInput = document.getElementById('searchInput').value;
    const searchFilter = document.getElementById('searchFilter').value;

    // Construct the query URL based on the selected filter
    let queryUrl = '/api/rpki?';
    if (searchFilter === 'asn') queryUrl += `ASN=${searchInput}&`;
    else if (searchFilter === 'prefix') queryUrl += `prefix=${searchInput}&`;
    else if (searchFilter === 'state') queryUrl += `state=${searchInput}`;

    // Fetch filtered data
    fetch(queryUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Filtered data:', data); 
      })
      .catch(error => {
        console.error('Error fetching filtered data:', error.message);
        console.error(error.stack);
      });
  }
});