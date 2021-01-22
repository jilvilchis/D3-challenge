// @TODO: YOUR CODE HERE!

// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;
// Define the chart's margins as an object
var chartMargin = {
  top: 20,
  right: 40,
  bottom: 90,
  left: 100
};
// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
// Create an SVG wrapper, append an SVG group that will hold our chart
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
// Append a group to the SVG area and shift it to the right and bottom
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(readData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(readData, d => d[chosenXAxis]),
    d3.max(readData, d => d[chosenXAxis])
  ])
  .range([0, chartWidth]);
  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(readData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(readData, d => d[chosenYAxis]),
    d3.max(readData, d => d[chosenYAxis])
  ])
  .range([chartHeight, 0]);
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to new circles on changes on X axes
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    return circlesGroup;
}

// function used for updating circles group with a transition to new circles on changes on Y axes
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// functions used for updating circles group with new tooltip on changes
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var label;
  if (chosenXAxis === "poverty"){
    label = "Poverty:";
  }else if (chosenXAxis === "age") {
    label = "Age:";
  }else if (chosenXAxis === "income"){
    label = "Household income:";
  }

  var ylabel;
  if (chosenYAxis === "healthcare"){
    ylabel = "Healthcare:";
  }else if (chosenYAxis === "obesity") {
    ylabel = "Obesity:";
  }else if (chosenYAxis === "smokes"){
    ylabel = "Smokes:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });
  
  circlesGroup.call(toolTip);
  // on mouseover event EVALUATE IF WE CAN CHANGE IT TO ARROW FUNCTION
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
  // on mouseout event
  .on("mouseout", function(data, index){
    toolTip.hide(data);
  });
  
  return circlesGroup;
} // end of function update ToolTip on changes

// Load data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(readData) {
console.log(readData);
// Parse data
readData.forEach(function(data) {
  data.poverty = +data.poverty;
  data.age = +data.age;
  data.income = +data.income;
  data.healthcare = +data.healthcare;
  data.obesity = +data.obesity;
  data.smokes = +data.smokes;
});
// let pov = readData.map(d=> d.poverty)
// console.log(pov);

// XLinearScale function called (defined above csv import code)
var xLinearScale = xScale(readData, chosenXAxis);
// console.log(xLinearScale);

// YLinearScale function called
var yLinearScale = yScale(readData, chosenYAxis);

// var yLinearScale = d3.scaleLinear()
// .domain([0, d3.max(readData, d => d.healthcare)])
// .range([chartHeight, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// Append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${chartHeight})`)
  .call(bottomAxis);

// Append y axis
var yAxis = chartGroup.append("g") //take care
  .classed("y-axis", true)
  .call(leftAxis);

// Append initial circles
var circlesGroup = chartGroup.selectAll("circle")
  .data(readData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis])) //(d.healthcare))
  .attr("r", 20)
  .attr("fill", "stateCircle") //from d3Style
  .attr("opacity", ".5");

// Create group for three x-axis labels

var xlabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
// Creating the Three different types of x labels
var labelPoverty = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") //value to grab for event listener
  .classed("active", true)
  .text("In Poverty (%)");

var labelAge = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "age") //value to grab for event listener
  .classed("inactive", true)
  .text("Age (Median)");  

var labelIncome = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") //value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");

// // Append y axis THIS CODE IS VALID ONLY IF WE USE Healthcare as y
// chartGroup.append("text")
//   .attr("transform", "rotate(-90)")
//   .attr("y", 0 - chartMargin.left)
//   .attr("x", 0 - (chartHeight/2))
//   .attr("dy", "1em")
//   .classed("axis-text", true)
//   .text("Lacks Healthcare (%)");

// Create group for three y-axis labels

var ylabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)");
// Creating the Three different types of x labels
var labelHealthcare = ylabelsGroup.append("text")
  .attr("y", 0 - chartMargin.left)
  .attr("x", 0 - (chartHeight/2))
  .attr("dy", "1em")
  .attr("value", "healthcare") //value to grab for event listener
  // .classed("axis-text", true)
  .classed("active", true)
  .text("Lacks Healthcare (%)");  

var labelObese = ylabelsGroup.append("text")
  .attr("y", 0 - chartMargin.left)
  .attr("x", 0 - (chartHeight/2))
  .attr("dy", "2em")
  .attr("value", "obesity") //value to grab for event listener
  // .classed("axis-text", true)
  .classed("inactive", true)
  .text("Obese (%)");  

var labelSmokes = ylabelsGroup.append("text")
  .attr("y", 0 - chartMargin.left)
  .attr("x", 0 - (chartHeight/2))
  .attr("dy", "3em")
  .attr("value", "smokes") //value to grab for event listener
  // .classed("axis-text", true)
  .classed("inactive", true)
  .text("Smokes (%)");  



// updateToolTip function
var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// x axis labels event listener
xlabelsGroup.selectAll("text")
  .on("click", function(){
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      // if chose x value different than current selection
      chosenXAxis = value;
      console.log(chosenXAxis);
      
      // update XLinearScale function
      xLinearScale = xScale(readData, chosenXAxis);

      // update x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // update circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // update toolTip with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "age") {
        labelAge.classed("active", true).classed("inactive", false);
        labelPoverty.classed("active", false).classed("inactive", true);
        labelIncome.classed("active", false).classed("inactive", true);
      } else if (chosenXAxis === "poverty") {
        labelPoverty.classed("active", true).classed("inactive", false);
        labelAge.classed("active", false).classed("inactive", true);
        labelIncome.classed("active", false).classed("inactive", true);
      } else if (chosenXAxis === "income") {
        labelIncome.classed("active", true).classed("inactive", false);
        labelAge.classed("active", false).classed("inactive", true);
        labelPoverty.classed("active", false).classed("inactive", true);
      }

    } // end if value !==chosenXAxis
  }) // end event x listener .on("click")

// y axis labels event listener
ylabelsGroup.selectAll("text")
  .on("click", function(){
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {
      // if chose y value different than current selection
      chosenYAxis = value;
      console.log(chosenYAxis);
      
      // update YLinearScale function
      yLinearScale = yScale(readData, chosenYAxis);

      // update x axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis); 

      // update circles with new x values
      circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

      // update toolTip with new info
      // circlesGroup = updateToolTip(chosenXAxis, circlesGroup); // FALTA ACTUALIZAR

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        labelHealthcare.classed("active", true).classed("inactive", false);
        labelObese.classed("active", false).classed("inactive", true);
        labelSmokes.classed("active", false).classed("inactive", true);
      } else if (chosenYAxis === "obesity") {
        labelObese.classed("active", true).classed("inactive", false);
        labelHealthcare.classed("active", false).classed("inactive", true);
        labelSmokes.classed("active", false).classed("inactive", true);
      } else if (chosenYAxis === "smokes") {
        labelSmokes.classed("active", true).classed("inactive", false);
        labelHealthcare.classed("active", false).classed("inactive", true);
        labelObese.classed("active", false).classed("inactive", true);
      }

    } // end if value !==chosenyAxis
  }) // end event y listener .on("click")

}).catch(e => console.log(e));

