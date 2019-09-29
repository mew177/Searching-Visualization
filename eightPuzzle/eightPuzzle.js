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
var NO = -1;

// block attribute
var side = 150;
var X = 400;
var Y = 50;
var blocks = [];
var b1_target = [];
var b2_target = [];
var b2s = [];
var FINISH = true;
var solution = [];

var EndState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
var MOVES = [
  [NO, 3, NO, 1],
  [NO, 4, 0, 2],
  [NO, 5, 1, NO],
  [0, 6, NO, 4],
  [1, 7, 3, 5],
  [2, 8, 4, NO],
  [3, NO, NO, 7],
  [4, NO, 6, 8],
  [5, NO, 7, NO]
]

class puzzleBlock {
  constructor(val, x=0, y=0, i=0, j=0, dx=5) {
    this.val = val;
    this.i = i;
    this.j = j;
    this.x = x;
    this.y = y;
    this.dx = dx;
  }

  setPosition(i, j) {
    this.i = i;
    this.j = j;
    this.x = X + side * this.j;
    this.y = Y + side * this.i;
  }

  draw () {
    //c.rect(this.x, this.y, side, side);
    c.strokeStyle = 'black';
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = 'red';
    c.font = "50px Arial";
    c.fillText(this.val, this.x + side/2, this.y + side/2);
  }
}

function EightPuzzle(problem=[], parent=null, g=0, f=0, h=0) {
  this.problem = problem;
  this.parent = parent;
  this.f_val = f;
  this.h_val = h;
  this.g_val = g;

  this.isGoal = function() {
    for (var i = 0; i < 9; i++) {
      if (problem[i] != EndState[i]) {
        return false;
      }
    }
    return true;
  }

  // initialize problem
  this.init = function() {
    // clear canvas
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (this.problem.length != 9) {
      // if doesn't provide initial problem
      for(var i = 0; i < EndState.length; i++) {
        while (this.problem.length < 9) {
          var randInt = EndState[Math.floor(Math.random()*9)];
          if (!this.problem.includes(randInt)) {
            this.problem.push(randInt);
          }
        }
      }
    }
    // initialize block object
    for (var i = 0; i < 9; i++) {
      blocks.push(new puzzleBlock(i));
    }

    // set block object position
    for (var i = 0; i < 9; i++) {
      blocks[this.problem[i]].setPosition(Math.floor(i/3), i%3);
    }
  }

  this.generateMoves = function() {
    var moves = [];
    var zero = this.problem.indexOf(0);
    for (var m = 0; m < 4; m++) {
      if (MOVES[zero][m] != NO) {
        var nowState = this.problem.slice();
        nowState[zero] = nowState[MOVES[zero][m]];
        nowState[MOVES[zero][m]] = 0;
        moves.push(new EightPuzzle(nowState, this, this.g_value()+1));
      }
    }
    return moves;
  }

  this.hash = function() {
    var h = ''
    for (var i = 0; i < 9; i++) {
      h += this.problem[i];
    }
    return h;
  }

  this.path = function() {
    solution = [this];
    var node = this;
    while (node.parent != null) {
      solution.push(node.parent);
      node = node.parent;
    }
    solution.push(null);
  }

  this.f_value = function() {
    this.f_val = this.h_value() + this.g_value();
    return this.f_val
  }

  this.g_value = function() {
    return this.g_val;
  }


  this.h_value = function(MODE=0) {
    var h = 0;
    switch(MODE) {
      case 1:
        // no heuristic function
        break;
      case 2:
        // misplaced tile
        for (var i = 0; i < 9; i++) {
          if (this.problem[i]!=0 && EndState[i]!=this.problem[i]) {
            h += 1;
          }
        }
      default:
        // manhattan distance
        for (var i = 0; i < 9; i++) {
          var num = this.problem[i]
          if (num != 0) {
            var x_s = Math.floor(i / 3);
            var y_s = i % 3;
            var x_e = Math.floor((num-1) / 3);
            var y_e = (num - 1) % 3;
            h += (Math.abs(x_e - x_s) + Math.abs(y_e - y_s));
          }
        }
    }

    this.h_val = h;
    return this.h_val;
  }

}

function drawGrid() {
  for(var i = 0; i < 9; i++) {
    c.rect(X+side*(Math.floor(i/3)), Y+side*(i%3), side, side);
  }
}

function drawBlocks() {
    if (blocks.length == 9) {
      // clear canvas
      c.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawGrid();
      for (var i = 0; i < 9; i++) {
        blocks[i].draw();
      }
    }
}

// move a block to location (x, y)
function moveTo(obj, x, y) {
  if (x == obj.x && y == obj.y) {
    return true;
  }

  if (obj.x - x > 0) {
    obj.x -= obj.dx;
  } else if (obj.x - x < 0) {
    obj.x += obj.dx;
  }

  if (obj.y - y > 0) {
    obj.y -= obj.dx;
  } else if (obj.y - y < 0){
    obj.y += obj.dx;
  }
  return false;
}

function blocks2Swap(p1, p2) {
  for (var i = 0; i < 9; i++) {
    if (p1.problem[i] != p2.problem[i]) {
      return [p1.problem[i], p2.problem[i]];
    }
  }
}

function animateSolution() {

  if (FINISH) {
    solution.pop();
    if (solution.length < 2) {
      console.log('Finish animation');
      return;
    }
    b2s = blocks2Swap(solution[solution.length-1], solution[solution.length-2]);
    b1_target = [blocks[b2s[0]].x, blocks[b2s[0]].y];
    b2_target = [blocks[b2s[1]].x, blocks[b2s[1]].y];
    FINISH = false;
  }

  requestAnimationFrame(function(){
    animateSolution(solution);
  });
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);

  var c1 = moveTo(blocks[b2s[0]], b2_target[0], b2_target[1]);
  var c2 = moveTo(blocks[b2s[1]], b1_target[0], b1_target[1]);
  if (c1 && c2) {
    FINISH = true;
  }

  drawBlocks();
}

// variables initialization
var queue = null;
var next = null;
var map = null;
var init_puzzle = new EightPuzzle([1,2,3,4,5,6,7,8,0]);;

function dfs() {
  var solution = [];
  while (queue.len > 0) {
    next = queue.pop();
    if (next.isGoal()) {
      solution = next.path();
      queue.clear();
    } else {
      map.put(next.hash(), next.f_value());

      var neighbors = next.generateMoves();
      for (var i = 0; i < neighbors.length; i++) {
        // 1. if state has not been visited
        // 2. this state has lower f_value than record
        if (!map.exists(neighbors[i].hash()) ||
        (map.exists(neighbors[i].hash()) &&
        map.get(neighbors[i].hash()) > next.f_value())) {
            queue.add(neighbors[i]);
        }
      }
    }
  }
}

function initiate_puzzle() {
  blocks = [];
  init_puzzle = new EightPuzzle();
  init_puzzle.init();
  drawBlocks();
  document.getElementById('status').innerHTML = 'Ready';
}

function init_dfs() {
  b1_target = [];
  b2_target = [];
  b2s = [];
  FINISH = true;
  solution = [];

  document.getElementById('status').innerHTML = 'Searching...';
  queue = new priorityQueue();
  map = new hashtable();
  queue.add(init_puzzle);
  dfs();
  document.getElementById('status').innerHTML = 'Finish';
}
