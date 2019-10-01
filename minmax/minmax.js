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

var LEFT = 0;
var RIGHT = 1;

function init() {
  nodes = [];
  start_node = 0;

  var role = start_player;
  var rec = null;
  var previous_nodes = [rec];
  var this_nodes = [];
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
        rec = new Node(role, i, j, previous_nodes[Math.floor(j/branch)]);
      } else if (i == maxLevel-1) {
        rec = new Node(role, i, j, previous_nodes[Math.floor(j/branch)], Math.floor(Math.random()*20));
      } else {
        start_node += 1;
        rec = new Node(role, i, j, previous_nodes[Math.floor(j/branch)]);
      }

      if (i != 0 ) {
        previous_nodes[Math.floor(j/branch)].children.push(rec);
      }
      this_nodes.push(rec);
      nodes.push(rec);
    }

    previous_nodes = this_nodes.slice();
    this_nodes = [];
  }

  document.getElementById('stat').innerHTML = "Visited nodes: " + 0 + ". Total nodes: " + nodes.length;
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
    var text = nodes[i].val;
    if (text == null) {
      text = 'X';
    }
    cxt.fillText(text, leftMargin+((win_width-leftMargin)/(Math.pow(branch, nodes[i].level)+1))*(nodes[i].index+1)-(radius/2), root_y+nodes[i].level*level_height+(radius/2));
  }
}

function minimax(baseIndex, level, index=0, count=1) {
  if (level < 0) {
    console.log(nodes[0].path());
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

    minimax(baseIndex, level, index, count+1);
  });

  nodes[baseIndex+index].toParent();
  nodes[baseIndex+index].visit();
  index += 1;
  draw_tree();
  document.getElementById('stat').innerHTML = "Visited nodes: " + count + ". Total nodes: " + nodes.length;
}

function alphabeta(node, direction, count=0) {
  if (node == null) {
    draw_tree(nodes[0].path());
    return ;
  }
  requestAnimationFrame(function() {
    alphabeta(node, direction, count);
  });

  if(!node.visit()) {
    // if this node is first visited
    count += 1;
  }

  if (checkValue(node)) {
    if (upCheck(node)) {
      // if prune the rest of branch
      // back to parent node
      // state comfimred => mark as visited
      update(node);
      node.visit();
      node = node.parent;
    } else {
      // keep going on children node
      node = nextNode(node, direction);
    }
  } else {
    node = nextNode(node, direction);
  }


  draw_tree();
  document.getElementById('stat').innerHTML = "Visited nodes: " + count + ". Total nodes: " + nodes.length;

  // check whether value of this node is null or not
  function checkValue(node) {
    if (node != null) {
      if (node.val == null) {
        return false;
      } else {
        return true;
      }
    }
  }

  // update parent's node with this node
  function update(node) {
    if (node.parent != null) {
      if (node.parent.val == null) {
        node.parent.val = node.val;
        node.parent.from = node;
      } else if (node.parent.role == MAXPLAYER && node.val > node.parent.val) {
        node.parent.val = node.val;
        node.parent.from = node;
      } else if (node.parent.role == MINPLAYER && node.val < node.parent.val) {
        node.parent.val = node.val;
        node.parent.from = node;
      }
    }
  }

  function hasUnvisitedChild(node) {
    if (node != null) {
      for (var i = 0; i < node.node.children.length; i++) {
        if (!node.children[i].visited) {
          return false;
        }
      }
    }
    return true;
  }

  // return next node to process
  function nextNode(node, direction) {
    if (direction == LEFT) {
      if (node != null) {
        for (var i = 0; i < node.children.length; i++) {
          if (!node.children[i].visited) {
            return node.children[i];
          }
        }
      }
    } else {
      if (node != null) {
        for (var i = node.children.length-1; i >= 0; i--) {
          if (!node.children[i].visited) {
            return node.children[i];
          }
        }
      }
    }
    // no children hasn't been visited => node state comfirmed
    update(node);
    node.visit();
    return node.parent;
  }

  function upCheck(node) {
    if (node != null) {
      if (node.val != null && node.parent != null && node.parent.val != null) {
        // if this value and parent's is not null, check state with parent's state
        if (node.parent.role == MAXPLAYER) {
          // parent is a max player
          if (node.val < this.parent.val) {
            // this state has a lower value
            // prune rest of the branch
            return true;
          }
        } else {
          // parent is a min player
          if (node.val > node.parent.val) {
            // this state has a higher value
            // prune rest of the branch
            return true;
          }
        }
      }
    }
    // keep tracking on branch
    return false;
  }
}

function resetNodes() {
  for (var i = 0 ; i < nodes.length; i++) {
    nodes[i].color = 'black';
    nodes[i].visited = false;
    nodes[i].from = null;
    nodes[i].val = nodes[i].orgVal;
  }
  cxt.clearRect(0, 0, window.innerWidth, window.innerHeight);
  draw_tree();
}

function initialize() {
  init();
  draw_tree();
}

function startminimax() {
  resetNodes();
  minimax(start_node+1, maxLevel-1);
}

function startalphabeta(direction=1) {
  resetNodes();
  alphabeta(nodes[0], direction);
}
