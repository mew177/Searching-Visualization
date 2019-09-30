var canvas = document.querySelector('canvas');

// canvas location and attribute
var win_width = window.innerWidth;
var win_height = 600;
canvas.width = win_width;
canvas.height = window.innerHeight;
canvas.style.top = window.innerHeight-win_height + "px";
canvas.style.left = window.innerWidth-win_width + "px";
canvas.style.position = "absolute";

var cxt = canvas.getContext('2d');

var level_height = 100;
var root_x = win_width/2;
var root_y = 50;
var leftMargin = 40;
var maxLevel = 6;
var branch = 2;
var start_player = MAXPLAYER;
var nodes = [];
var start_node = 0;

function init() {
  nodes = [];
  start_node = 0;

  var role = start_player;
  var rec = null;
  var previous_nodes = [rec];
  var this_nodes = [];
  var count = 0;
  for (var i = 0; i < maxLevel; i++) {
    for (var j = 0; j < Math.pow(branch, i); j++) {
      // determine role of this node
      role = start_player;
      if ((start_player == MAXPLAYER && i%2 == 1) ||
          (start_player == MINPLAYER && i%2 == 0)) {
        role = MINPLAYER
      }

      // if this is leaf node, set its value as a random number
      if (i == 0) {
        rec = new Node(role, i, j, count++, previous_nodes[Math.floor(j/branch)]);
      } else if (i == maxLevel-1) {
        rec = new Node(role, i, j, count++, previous_nodes[Math.floor(j/branch)], Math.floor(Math.random()*20));
      } else {
        start_node += 1;
        rec = new Node(role, i, j, count++, previous_nodes[Math.floor(j/branch)]);
      }

      this_nodes.push(rec);
      nodes.push(rec);
    }

    previous_nodes = this_nodes.slice();
    this_nodes = [];
  }
}

function drawPath(paths) {
  for (var i = 1; i < paths.length; i++) {
    cxt.strokeStyle = 'blue';
    cxt.lineWidth = 5;
    cxt.beginPath();
    cxt.moveTo(leftMargin+((win_width-leftMargin)/(Math.pow(branch, paths[i].level)+1))*(paths[i].index+1), root_y+paths[i].level*level_height)
    cxt.lineTo(leftMargin+((win_width-leftMargin)/(Math.pow(branch, paths[i].parent.level)+1))*(paths[i].parent.index+1), root_y+paths[i].parent.level*level_height);
    cxt.stroke();
  }
}

function draw_tree(paths=[], radius=16) {

  cxt.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // draw arcs between nodes
  for (var i = 1; i < nodes.length; i++) {
      cxt.strokeStyle = 'black';
      cxt.lineWidth = 3;
      cxt.beginPath();
      cxt.moveTo(leftMargin+((win_width-leftMargin)/(Math.pow(branch, nodes[i].level)+1))*(nodes[i].index+1), root_y+nodes[i].level*level_height)
      cxt.lineTo(leftMargin+((win_width-leftMargin)/(Math.pow(branch, nodes[i].parent.level)+1))*(nodes[i].parent.index+1), root_y+nodes[i].parent.level*level_height);
      cxt.stroke();
  }

  // draw solution path
  if (paths.length > 0) {
    for (var i = 1; i < paths.length; i++) {
      cxt.strokeStyle = 'blue';
      cxt.lineWidth = 5;
      cxt.beginPath();
      cxt.moveTo(leftMargin+((win_width-leftMargin)/(Math.pow(branch, paths[i].level)+1))*(paths[i].index+1), root_y+paths[i].level*level_height)
      cxt.lineTo(leftMargin+((win_width-leftMargin)/(Math.pow(branch, paths[i].parent.level)+1))*(paths[i].parent.index+1), root_y+paths[i].parent.level*level_height);
      cxt.stroke();
    }
  }

  var idx = 0;
  for (var lev = 0; lev < maxLevel; lev++) {
    // MAX or MIN player label
    cxt.font = "15px Arial";
    cxt.fillStyle = 'black';
    if (lev % 2 == 0) {
      if (start_player == MAXPLAYER) {
        cxt.fillText("MAX", 10, root_y+lev*level_height);
      } else {
        cxt.fillText("MIN", 10, root_y+lev*level_height);
      }
    } else {
      if (start_player == MINPLAYER) {
        cxt.fillText("MAX", 10, root_y+lev*level_height);
      } else {
        cxt.fillText("MIN", 10, root_y+lev*level_height);
      }
    }
  }

  for (var i = 0; i < nodes.length; i++) {
    // draw circle of each node
    cxt.beginPath();
    cxt.arc(leftMargin+((win_width-leftMargin)/(Math.pow(branch, nodes[i].level)+1))*(nodes[i].index+1), root_y+nodes[i].level*level_height, radius, 0, Math.PI * 2, false);
    cxt.strokeStyle = nodes[i].color;
    cxt.fillStyle = 'white';
    cxt.fill();
    cxt.stroke();

    cxt.font = "15px Arial";
    cxt.fillStyle = 'black';
    cxt.fillText(nodes[i].val, leftMargin+((win_width-leftMargin)/(Math.pow(branch, nodes[i].level)+1))*(nodes[i].index+1)-(radius/2), root_y+nodes[i].level*level_height+(radius/2));
  }
}

function minmax(baseIndex, level, index=0, count=1) {
  if (level < 0) {
    draw_tree(nodes[0].path());
    return ;
  }

  requestAnimationFrame(function() {
    if (index > Math.pow(branch, level)-1) {
      baseIndex = 0;
      level -= 1;
      for (var i = 0; i <= level-1; i++) {
        for (var j = 0; j < Math.pow(branch, i); j++) {
            baseIndex += 1;
        }
      }
      index = 0;
    }

    minmax(baseIndex, level, index, count+1);
  });

  nodes[baseIndex+index].toParent();
  nodes[baseIndex+index].visit();
  index += 1;
  draw_tree();
  document.getElementById('stat').innerHTML = "Visited nodes: " + count;
}

function alphabeta() {

}

function initialize() {
  init();
  draw_tree();
}

function startminmax() {
  minmax(start_node+1, maxLevel-1);
}
