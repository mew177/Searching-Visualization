var canvas = document.querySelector('canvas');

// canvas location and attribute
var win_width = 500;
var win_height = 500;
canvas.width = win_width;
canvas.height = win_height;
canvas.style.position = "absolute";

var ctx = canvas.getContext('2d');

var Colors = ["black", "red", "green", "blue", "yellow", "purple", "pink", "Silver", "Fuchsia"];
var Points = [];
var Centers = [];
var dense = 0.5;

function draw_points() {

  ctx.clearRect(0, 0, win_width, win_height);
  // draw points
  for (var i = 0; i < Points.length; i++) {
    ctx.fillStyle = Colors[Points[i].group];
    ctx.beginPath();
    ctx.arc(Points[i].x, Points[i].y, 3, 0, Math.PI * 2, true);
    ctx.fill();
  }

  // draw center points
  for (var i = 0; i < Centers.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = Colors[Centers[i].group];
    ctx.arc(Centers[i].x, Centers[i].y, 8, 0, Math.PI * 2, true);
    ctx.fill();
  }

}

function create_points() {
  Points = [];
  var num_points = document.getElementById('num_points').value;
  var num_centers = document.getElementById('num_centers').value;

  var clusters = [];
  for (var i = 0; i < num_centers; i++) {
    clusters.push(new Point(Math.random()*win_width, Math.random()*win_height));
  }

  for (var i = 0; i < num_points; i++) {
    if (Math.random() > dense) {
      while (true) {
        var g = Math.floor(Math.random()*num_centers);
        var p = new Point(clusters[g].x + Math.random()*80-40, clusters[g].y + Math.random()*80-40)
        if ( (p.x >= 0 && p.x <= win_width) && (p.y >= 0 && p.y <= win_height) ) {
          Points.push(p);
          break;
        }
      }
    } else {
      Points.push(new Point(Math.random()*win_width, Math.random()*win_height));
    }
  }
  console.log(Points);
  draw_points();
}

function create_centers() {
  Centers = [];
  var num_centers = document.getElementById('num_centers').value;

  for (var i = 0; i < num_centers; i++) {
    Centers.push(new Point(Math.random()*win_width, Math.random()*win_height, i+1, true));
  }

  draw_points();
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2));
}

function update_group() {
  for (var p = 0; p < Points.length; p++) {
    dis = [];
    for (var c = 0; c < Centers.length; c++) {
      dis.push(distance(Points[p], Centers[c]));
    }
    Points[p].setGroup(Centers[dis.indexOf(Math.min.apply(Math, dis))].group);
  }
}

function move_center_animation(targets, x=1, pace=10) {
  if (x > pace) {
    return ;
  }

  requestAnimationFrame(function() {
    move_center_animation(targets, x+1);
  });

  for (var c = 0; c < Centers.length; c++) {
    Centers[c].x += (targets[c].x - Centers[c].x) * x / pace;
    Centers[c].y += (targets[c].y - Centers[c].y) * x / pace;
  }

  draw_points();

}

function update_center() {
  var targets = new Array(Centers.length);
  for (var c = 0; c < Centers.length; c++) {
    var X = 0;
    var Y = 0;
    var count = 0;
    for (var p = 0; p < Points.length; p++) {
      if (Points[p].group == Centers[c].group) {
        X += Points[p].x;
        Y += Points[p].y;
        count += 1;
      }
    }
    targets[c] = new Point(X/count, Y/count);
  }

  move_center_animation(targets);
}


function update() {
  update_group();
  update_center();
}

