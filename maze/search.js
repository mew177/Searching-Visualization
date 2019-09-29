var canvas = document.querySelector('canvas');

// canvas location and attribute
var win_width = window.innerWidth;
var win_height = 580;
canvas.width = win_width;
canvas.height = window.innerHeight;
canvas.style.top = window.innerHeight-win_height + "px";
canvas.style.left = window.innerWidth-win_width + "px";
canvas.style.position = "absolute";

var c = canvas.getContext('2d');


let SEARCH_MODE = -1;
// configuration attribute
var grid_w = 20;
var grid_h = 20;
var rows = Math.floor(win_height / grid_w);
var cols = Math.floor(win_width / grid_h);
var blocks = create2DArray(cols, rows);

var colors = ['white', 'black', 'red', 'yellow', 'green', 'blue'];
var dense = 0.32;
var cost = 1;

function drawPath(paths) {
  c.beginPath();
  c.moveTo((grid_h/2), (grid_w/2));
  for (var i = 0; i < paths.length ; i++) {
    var node = paths;
    c.lineTo(paths[i].x+(grid_h/2), paths[i].y+(grid_w/2));
  }
  c.strokeStyle = 'red';
  c.lineWidth = 5;
  c.stroke();
}

function showCost(cost) {
  document.getElementById('cost').innerHTML = 'Cost: ' + cost;
}

// start searching process
var queue = null;
var queue2 = null;
var map = null;
var shortest_record = null;
var next = null;


/*=========== A* searching ===========*/
function astar() {
  if (SEARCH_MODE != 0) {
    return;
  }
  requestAnimationFrame(astar);

  c.clearRect(0, 0, win_width, win_height);
  drawGrid();
  fillblocks();

  if (queue.len > 0) {
    next = queue.pop();
    if (next.isGoal()) {
      blocks[next.i][next.j].setColor('yellow');
      queue.clear();
      solution = next.path();

    } else if (next != null) {
      var block = blocks[next.i][next.j];

      map.put(next.hash(), next.f_value());
      block.setColor('yellow');

      var neighbors = next.generateNeighbors();

      for(var i = 0; i < neighbors.length; i++) {
        if(neighbors[i].f_value() > map.get(neighbors[i].hash())) {
          queue.add(neighbors[i]);
        }
      }
    }

    showCost(next.path().length-2); // eliminate start and end state
    drawPath(next.path());
  } else {
    if (next.isGoal()) {
      drawPath(next.path());
      showCost(next.path().length-2);
    } else {
      showCost('No solution');
    }
  }
}

function astar_start() {
  SEARCH_MODE = 0;
  initializeBlock();
  drawGrid();
  fillblocks();

  queue = new priorityQueue();
  map = new hashtable();
  queue.add(new Block(0, 0, grid_w, grid_h));

  astar();
}

/*=========== bfs searching ===========*/
function bfs() {
  if (SEARCH_MODE != 1) {
    c.clearRect(0, 0, win_width, win_height);
    return;
  }
  requestAnimationFrame(bfs);

  c.clearRect(0, 0, win_width, win_height);
  drawGrid();
  fillblocks();

  if (queue.len > 0) {
    next = queue.pop();
    if (next.isGoal()) {
      blocks[next.i][next.j].setColor('yellow');
      queue.clear();
      solution = next.path();

    } else if (next != null && !map.exists(next.hash())) {
      var block = blocks[next.i][next.j];

      map.put(next.hash(), true);
      block.setColor('yellow');

      var neighbors = next.generateNeighbors();

      for(var i = 0; i < neighbors.length; i++) {
        queue.appendleft(neighbors[i]);
      }
    }

    showCost(next.path().length-2); // eliminate start and end state
    drawPath(next.path());
  } else {
    if (next.isGoal()) {
      drawPath(next.path());
      showCost(next.path().length-2);
    } else {
      showCost('No solution');
    }
  }
}

function bfs_start() {
  SEARCH_MODE = 1;
  initializeBlock();
  drawGrid();
  fillblocks();

  queue = new deque();
  map = new hashtable();
  queue.appendleft(new Block(0, 0, grid_w, grid_h));

  bfs();
}

/*=========== dfs searching ===========*/
function dfs() {
  if (SEARCH_MODE != 2) {
    return;
  }
  requestAnimationFrame(dfs);

  c.clearRect(0, 0, win_width, win_height);
  drawGrid();
  fillblocks();

  if (queue.len > 0) {
    next = queue.pop();
    if (next.isGoal()) {
      blocks[next.i][next.j].setColor('yellow');
      queue.clear();
      solution = next.path();

    } else if (next != null && !map.exists(next.hash())) {
      var block = blocks[next.i][next.j];

      map.put(next.hash(), true);
      block.setColor('yellow');

      var neighbors = next.generateNeighbors();

      for(var i = 0; i < neighbors.length; i++) {
        queue.appendright(neighbors[i]);
      }
    }

    showCost(next.path().length-2); // eliminate start and end state
    drawPath(next.path());
  } else {
    if (next.isGoal()) {
      drawPath(next.path());
      showCost(next.path().length-2);
    } else {
      showCost('No solution');
    }
  }
}

function dfs_start() {
  SEARCH_MODE = 2;
  initializeBlock();
  drawGrid();
  fillblocks();

  queue = new deque();
  map = new hashtable();
  queue.appendright(new Block(0, 0, grid_w, grid_h));

  dfs();
}
