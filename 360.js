d3.select(window)
  .on("mousemove", mousemove)
  .on("mouseup", mouseup);

var width = 500,
  height = 500;

var data = [{
  text: 'First',
  lat: 0,
  lng: 0,
  type: 1,
  created: new Date()
    .getTime()
}];

var proj = d3.geo.orthographic()
  .translate([width / 2, height / 2])
  .clipAngle(90)
  .scale(190);

var sky = d3.geo.orthographic()
  .translate([width / 2, height / 2])
  .clipAngle(90)
  .scale(400);

var path = d3.geo.path()
  .projection(proj)
  .pointRadius(5);

var line = d3.svg.line()
  .x(function(d) {
    return d.x;
  })
  .y(function(d) {
    return d.y;
  })
  .interpolate("cardinal");

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .on("mousedown", mousedown);

queue()
  .defer(d3.json, "./world.json")
  .await(ready);

function ready(error, world) {
  var ocean_fill = svg.append("defs")
    .append("radialGradient")
    .attr("id", "ocean_fill")
    .attr("cx", "75%")
    .attr("cy", "25%");
  ocean_fill.append("stop")
    .attr("offset", "5%")
    .attr("stop-color", "#fff");
  ocean_fill.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#ababab");

  var globe_highlight = svg.append("defs")
    .append("radialGradient")
    .attr("id", "globe_highlight")
    .attr("cx", "75%")
    .attr("cy", "25%");
  globe_highlight.append("stop")
    .attr("offset", "5%")
    .attr("stop-color", "#ffd")
    .attr("stop-opacity", "0.6");
  globe_highlight.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#ba9")
    .attr("stop-opacity", "0.2");

  var globe_shading = svg.append("defs")
    .append("radialGradient")
    .attr("id", "globe_shading")
    .attr("cx", "55%")
    .attr("cy", "45%");
  globe_shading.append("stop")
    .attr("offset", "30%")
    .attr("stop-color", "#fff")
    .attr("stop-opacity", "0");
  globe_shading.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#505962")
    .attr("stop-opacity", "0.3");

  var drop_shadow = svg.append("defs")
    .append("radialGradient")
    .attr("id", "drop_shadow")
    .attr("cx", "50%")
    .attr("cy", "50%");
  drop_shadow.append("stop")
    .attr("offset", "20%")
    .attr("stop-color", "#000")
    .attr("stop-opacity", ".5");
  drop_shadow.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#000")
    .attr("stop-opacity", "0");

  svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", proj.scale())
    .attr("class", "noclicks")
    .style("fill", "url(#ocean_fill)");

  svg.append("path")
    .datum(topojson.object(world, world.objects.land))
    .attr("class", "land noclicks")
    .attr("d", path);

  svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", proj.scale())
    .attr("class", "noclicks")
    .style("fill", "url(#globe_highlight)");

  svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", proj.scale())
    .attr("class", "noclicks")
    .style("fill", "url(#globe_shading)");

  var graticule = d3.geo.graticule();

  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

  setPoints(data);
  refresh();
  newPoints();
}

function color(d) {
  switch (d.type) {
    case 0:
      return '#543AFC';
    case 1:
      return '#333';
    case 2:
      return 'blue';
    case 3:
      return 'red';
    case 4:
      return 'green';
  }
}

var arc = d3.geo.greatArc();
var centerPos = proj.invert([width / 2, height / 2]);

function display(d) {
  d = arc.distance({
    source: [d.lng, d.lat],
    target: centerPos
  });
  if (d > 1.5) {
    debugger;
  }
  return (d > 1.5) ? 'none' : 'inherit';
}

var line = d3.svg.line()
  .x(function(d) {
    return d.x;
  })
  .y(function(d) {
    return d.y;
  })
  .interpolate("cardinal")
  .tension(0);

function refresh() {
  svg.selectAll(".land")
    .attr("d", path);
  svg.selectAll(".point")
    .attr("d", path);
  svg.selectAll(".graticule")
    .attr("d", path);

  svg.selectAll('.line')
    .attr('stroke', color)
    .style('opacity', display)
    .attr('d', function(d) {
      var obj = {
        x: proj([d.lng, d.lat])[0],
        y: proj([d.lng, d.lat])[1],
        type: d.type
      };
      return line([{
          x: sky([d.lng, d.lat])[0],
          y: sky([d.lng, d.lat])[1],
          type: d.type
        },
        obj
      ]);
    });

  svg.selectAll('.pin')
    .attr('transform', function(d) {
      var loc = proj([d.lng, d.lat]),
        x = loc[0],
        y = loc[1];
      return "translate(" + (x) + "," + (y) + ")";
    });
}

function setPoints(data) {

  // Drop out old data
  if (data.length > 10) {
    data.shift();
  }

  var points = svg.selectAll(".pin")
    .data(data, function(d) {
      return d.created;
    });
  var graticule = d3.geo.graticule();

  var pins = points.enter()
    .append('g')
    .attr('class', 'pin');

  // Lines
  var lines = svg.selectAll('.line')
    .data(data, function(d) {
      return d.created;
    });
  lines.enter()
    .append('path')
    .style('display', display)
    .attr('class', 'line')
    .attr('stroke-width', 0)
    .transition()
    .duration(500)
    .attr('stroke-width', 2)
    .style('opacity', 1)
    .transition()
    .ease('out-in')
    .duration(1000)
    .attr('stroke-width', 0)
    .style('opacity', 0);

  lines.exit()
    .remove();

  // Pulse
  pins
    .append('circle')
    .style('fill', 'none')
    .style('stroke-width', 1)
    .style('stroke', color)
    .attr('r', 0)
    .style('display', display)
    .style('opacity', 0)
    .attr('r', 0)
    .transition()
    .duration(500)
    .style('opacity', 1)
    .transition()
    .ease('out-in')
    .duration(1000)
    .attr('r', 20)
    .style('opacity', 0);

  // Point
  pins.append('circle')
    .style('fill', color)
    .style('display', display)
    .style('opacity', 0)
    .attr('r', 0)
    .transition()
    .duration(500)
    .attr('r', 3)
    .style('opacity', 1)
    .transition()
    .duration(1000)
    .style('opacity', 0);

  points.exit()
    .remove();
}


var m0, o0, mouseDown;

function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = proj.rotate();
  mouseDown = true;
  d3.event.preventDefault();
}

function mousemove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY],
      o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
    o1[1] = o1[1] > 30 ? 30 :
      o1[1] < -30 ? -30 :
      o1[1];
    proj.rotate(o1);
    sky.rotate(o1);
    refresh();
  }
}

function mouseup() {
  mouseDown = false;
  if (m0) {
    mousemove();
    m0 = null;
  }
}

function newPoints() {

  setInterval(function() {
    data.push({
      text: "New " + Math.floor(Math.random() * 100),
      lat: Math.floor(Math.random() * 359),
      lng: Math.floor(Math.random() * 359),
      type: Math.floor(Math.random() * 4),
      created: new Date()
        .getTime()
    });

    setPoints(data);
    refresh();

  }, 300);
}

proj.rotate([0, -20, 0]);
sky.rotate([0, -20, 0]);

d3.timer(function() {
  if (!mouseDown) {
    var curr = proj.rotate();
    proj.rotate([curr[0] + 0.2, curr[1], curr[2]]);
    sky.rotate([curr[0] + 0.2, curr[1], curr[2]]);
    refresh();
  }
});