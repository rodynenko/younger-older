var sex = 'all',
    territory = 'city+village',
    visual = 'original',
    year = '2015',
    margin = {top:20, right: 20, bottom: 50, left: 65},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]).domain([0, 100]),
    y = {
      original: d3.scale.linear().range([height, 0]).domain([-100, 100]),
      classical : d3.scale.linear().range([height, 0]).domain([0, 100])
    };

var xAxis = d3.svg.axis().scale(x).tickSize(10).orient("bottom"),
    yAxis = {
      original: d3.svg.axis().scale(y.original).orient('right').tickFormat(function(d){ return d<0 ? ( -d +'%' ) : (d+'%'); }),
      classical: d3.svg.axis().scale(y.classical).orient('right').tickFormat(function(d) { return (d+'%'); })
    };

var younger = {
      original: d3.svg.area().x(function(d){ return x(d.age); }).y0(y[visual](0)).y1(function(d){ return y[visual](d[year+'_'+territory+'_'+sex+'_younger']); }),
      classical: d3.svg.line().x(function(d){ return x(d.age); }).y(function(d){ return y[visual](d[year+'_'+territory+'_'+sex+'_younger']); })
    },
    older = {
      original: d3.svg.area().x(function(d){ return x(d.age); }).y0(y[visual](0)).y1(function(d){ return y[visual](-d[year+'_'+territory+'_'+sex+'_older']); }),
      classical: d3.svg.line().x(function(d){ return x(d.age); }).y(function(d){ return y[visual](d[year+'_'+territory+'_'+sex+'_older']); })
    };

var svg = d3.select('#chart').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', 'translate('+margin.left+','+margin.top+')');

d3.csv('younger-older-ukraine-2001-2015.csv', function(err, d){
  if (err) throw err;
  //axis
  svg.append('g')
    .attr('class', 'xaxis')
    .attr('transform', 'translate(0,'+(height+5)+')')
    .call(xAxis)
      .append('text')
      .attr('y', 40)
      .attr('dx', 10)
      .style("text-anchor", "start")
      .text('Вік');

  svg.append('g')
    .attr('class', 'yaxis')
    .call(yAxis[visual]);

  svg.selectAll('.yaxis line').attr('x1', -10).attr('x2',width+5);
  svg.selectAll('.yaxis text').attr('x', -50);

  svg.select('.yaxis').append('text')
    .attr('class', 'comments younger')
    .attr('text-anchor','end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -55)
    .attr('dx', 5)
    .text('ВИ МОЛОДШІ за ...%');

  svg.select('.yaxis').append('text')
    .attr('class', 'comments older')
    .attr('text-anchor','start')
    .attr('transform', 'rotate(-90)')
    .attr('y', -55)
    .attr('dx', -height-5)
    .text('ВИ СТАРШІ за ...%');

  //areas
  svg.append("path")
      .datum(d)
      .attr("id", "older")
      .attr("class", "area " + visual)
      .attr("d", older[visual]);
  svg.append("path")
      .datum(d)
      .attr("id", "younger")
      .attr("class", "area "+visual)
      .attr("d", younger[visual]);
      //baseline
  svg.append('g')
    .attr('class', 'baseline')
    .attr('transform', 'translate(0,'+y[visual](0)+')')
    .append('line')
      .attr('x1', -10)
      .attr('x2', width+10)
      .attr('y2', 0);

  //set action on selector change
  d3.selectAll("select").on("change", function() {
    year = document.getElementById('year').value;
    sex = document.getElementById('sex').value;
    territory = document.getElementById('territory').value;
    visual = document.getElementById('visual').value;
		update();
	});


  function another_visual(){
    return visual === 'original'? 'classical' : 'original';
  }

  //update function
  function update(){
    // change y axis
    svg.select('.yaxis')
      .call(yAxis[visual]);
    svg.selectAll('.yaxis line').attr('x1', -10).attr('x2',width+5);
    svg.selectAll('.yaxis text').attr('x', -50);
    svg.selectAll('.yaxis text.comments').attr('x', 0);
    // change baseline
    svg.selectAll('.baseline')
      .transition()
      .duration(1000)
      .attr('transform', 'translate(0,'+y[visual](0)+')');

    //change yAxis labels
    if (visual == 'original'){
      svg.selectAll('.comments.older')
        .transition()
        .duration(1000)
        .attr('text-anchor','start')
        .attr('transform', 'rotate(-90)')
        .attr('y', -55)
        .attr('dx', -height-5);
      svg.selectAll('.comments.younger')
        .transition()
        .duration(1000)
        .attr('text-anchor','end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -55)
        .attr('dx', 5);
    }else{
      svg.selectAll('.comments.older')
        .transition()
        .duration(1000)
        .attr('text-anchor','start')
        .attr('transform', 'rotate(0)')
        .attr('y', height-10)
        .attr('dx', 35);
      svg.selectAll('.comments.younger')
        .transition()
        .duration(1000)
        .attr('text-anchor','start')
        .attr('transform', 'rotate(0)')
        .attr('y', 15)
        .attr('dx', 35);
    }
    // diagrams
    svg.select("#older")
      .classed(another_visual(), false)
      .classed(visual, true)
      .transition()
      .duration(1000)
      .attr("d", function(m) {
        return older[visual](d);
      });
    svg.select("#younger")
      .classed(another_visual(), false)
      .classed(visual, true)
      .transition()
      .duration(1000)
      .attr("d", function(m) {
        return younger[visual](d);
      });
  };

// mouse move

  var focus = svg.append("g")
  	.attr("class", "focus")
  	.style("display", "none");
  focus.append("circle")
  	.attr("class", "older_marker")
  	.attr("r", 5);
  focus.append("circle")
  	.attr("class", "younger_marker")
  	.attr("r", 5);
  focus.append("text")
  	.attr("class", "older_value")
  	.attr("x", 9)
  	.attr("dy", ".33em");
  focus.append("text")
  	.attr("class", "younger_value")
  	.attr("x", 9)
  	.attr("dy", ".33em");
  focus.append("line")
  	.attr("x1", 0)
  	.attr("x2", 0)
  	.attr("y1", height);
  focus.append("text")
  	.attr("class", "agevalue")
  	.attr("text-anchor", "middle")
  	.attr("y", height);

  svg.append("rect")
  	.attr("class", "overlay")
  	.attr("width", width)
  	.attr("height", height)
  	.on("mouseover", function() {
  		focus.style("display", null);
  	})
  	.on("mouseout", function() {
  		focus.style("display", "none");
  	})
  	.on("mousemove", mousemove);

  function roundData(n){
    return Math.round(n*10)/10;
  }
  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
      bisectAge = d3.bisector(function(m) { return m.age; }).left;
      i = bisectAge(d, x0, 1),
      coef={
        original: -1,
        classical: 1
      },
      d0 = d[i - 1],
      d1 = d[i],
      dn = x0 - d0.age > d1.age - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(dn.age) + "," + y[visual](coef[visual]*dn[year+'_'+territory+'_'+sex+'_older']) + ")");
    focus.select("text.older_value").text(roundData(dn[year+'_'+territory+'_'+sex+'_older'])+"%");

    // Adjust indicator line and values.
    focus.select("line")
      .attr("y1", y[visual](dn[year+'_'+territory+'_'+sex+'_younger']) - y[visual](coef[visual]*dn[year+'_'+territory+'_'+sex+'_older']));
    focus.select(".younger_marker")
      .attr("cy", y[visual](dn[year+'_'+territory+'_'+sex+'_younger']) - y[visual](coef[visual]*dn[year+'_'+territory+'_'+sex+'_older']) );
    focus.select("text.younger_value")
      .attr("y", y[visual](dn[year+'_'+territory+'_'+sex+'_younger']) - y[visual](coef[visual]*dn[year+'_'+territory+'_'+sex+'_older']))
      .text(roundData(dn[year+'_'+territory+'_'+sex+'_younger'])+"%");
    focus.select("text.agevalue")
      .attr("y", y[visual](y[visual].domain()[0]) - y[visual](coef[visual]*dn[year+'_'+territory+'_'+sex+'_older'])+28)
      .text(dn.age);
  };

});
