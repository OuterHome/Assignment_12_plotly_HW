function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();

// Function to build metadata panel
function buildMetadata(sample) {
  var url = "/metadata"+`/${sample}`;
  d3.json(url).then(function(data) {
  console.log(data);
  var arrays = Object.entries(data);
  console.log(arrays);
  d3.select("ul")
    .html("")
    .selectAll("li")
    .data(arrays)
    .enter()
    .append("li")
    .html(function(d) {
      return d.join(": ")
    });
  
  // Build washing frequency gauge

  // Feed a washing frequency to the gauge
  var level = (data.WFREQ);
  console.log(level);

  // Trig to calc meter point (altered to represent nine 1/18 circle sections needed)
  var degrees = (180/20) - level,
      radius = .5;
  var radians = degrees * Math.PI / (180/20);
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  // Build scatterplot trace
  var data = [{ type: 'scatter',
    x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'Scrubs per Week',
      text: level,
      hoverinfo: 'text+name'},
    { values: [40/9, 40/9, 40/9, 40/9, 40/9, 40/9, 40/9, 40/9, 40/9, 40],
    rotation: 90,
    text: ['8-9', '7-8', '6-7', '5-6',
              '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['#82ca62', '8fcd72', '#9bcf81', '#a7d291', '#b2d4a0', '#bdd7af', '#c8d9be', '#d3dbce', '#dddddd', '#ffffff']},
            
    labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];
 
  // Define layout, and plot gauge
  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: 'Belly Button Washing Frequency <br>\
    Scrubs per week',
    height: 500,
    width: 450,
    xaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]}
  };

  Plotly.newPlot('gauge', data, layout);
})};

//Define function for building bubble and pie charts
function buildCharts(sample) {
  var url = "/samples"+`/${sample}`;
  d3.json(url).then(function(data) {
  console.log(data)

  // Build bubble plot trace
  var traceBubble = {
    x: data.otu_ids,
    y: data.sample_values,
    mode: "markers",
    type: "scatter",
    name: "Sample Values",
    hovertext: data.otu_labels,
    marker: {
      size: data.sample_values,
      color: data.otu_ids,
      text: data.otu_labels,
    }
  };

  var bubbleData = [traceBubble]

  // Define bubble plot layout, and plot chart 
  var bubbleLayout = {
    autosize: false,
    width: 1000,
    height: 500,
    title: "Belly Button Sample Values", 
    xaxis: { title: "Values" },
    yaxis: { title: "Sample ID" }
  };
  Plotly.newPlot("bubble", bubbleData, bubbleLayout);

  // Build pie chart trace

  // Convert data to proper format for slicing
  var otu_ids = data.otu_ids;
  console.log(otu_ids);
  var sample_values = data.sample_values;
  console.log(sample_values);
  var otu_labels = data.otu_labels;
  console.log(otu_labels);

  // Slice data to grab the top 10 records for reach chart category
  var slice_otu_ids = otu_ids.slice(0,10)
  console.log(slice_otu_ids);
  var slice_sample_values = sample_values.slice(0,10)
  console.log(slice_sample_values);
  var slice_otu_labels = otu_labels.slice(0,10)
  console.log(slice_otu_labels);

  var tracePie = {
    labels: slice_otu_ids,
    values: slice_sample_values,
    hovertext: slice_otu_labels,
    type: "pie"
  };
  console.log(tracePie);

  var pieData = [tracePie]
  console.log(pieData);

  // Define pie chart layout, and plot chart
  var pieLayout = {
    autosize: false,
    width: 450,
    height: 500,
    title: "Top 10 Samples"
  };

  Plotly.newPlot("pie", pieData, pieLayout)
})};