var canvas = document.querySelector('canvas');

// canvas location and attribute
var win_width = window.innerWidth;
var win_height = 620;
canvas.width = win_width;
canvas.height = window.innerHeight;
canvas.style.top = window.innerHeight-win_height + "px";
canvas.style.position = "absolute";

var c = canvas.getContext('2d');

// configuration attribute
var grid_w = 20;
var grid_h = 20;
var rows = Math.floor(win_height / grid_w);
var cols = Math.floor(win_width / grid_h);
var blocks = create2DArray(cols, rows);

var colors = ['white', 'black', 'red', 'yellow', 'green', 'blue'];
var dense = 0.32;
var cost = 1;

/*                      **
**  Prority queue Class **
**                      **/

class priorityQueue {
  constructor() {
    this.len = 0;
    this.x = new Array(this.len);
  }

  add(e) {
    var temp = new Array(this.len+1);
    var idx = -1
    for(var i = 0; i < this.len; i++) {
      if(e.f_value() < this.x[i].f_value()) {
        temp[i] = this.x[i];
        idx = i;
      } else if (e.f_value() == this.x[i].f_value()) {
        if (e.h_value() < this.x[i].h_value()) {
          temp[i] = this.x[i];
          idx = i;
        } else {
          temp[i+1] = this.x[i];
        }
      } else {
        temp[i+1] = this.x[i];
      }
    }
    temp[idx+1] = e;
    this.x = temp;
    //console.log(this.x);
    this.len += 1;
  }

  pop() {
    if (this.len <= 0) {
      console.log('Pop element from empty queue');
      return null;
    }
    var temp = new Array(this.len-1);
    for(var i = 0; i < this.len-1; i++) {
      temp[i] = this.x[i];
    }
    this.len -= 1;
    var p = this.x[this.len];
    this.x = temp;

    return p;
  }

  isEmpty() {
    return (this.len == 0);
  }

  clear() {
    this.len = 0;
    this.x = new Array(this.len);
  }

  exists(block) {
    return this.x.includes(block);
  }
}

/*              **
**  Deque Class **
**              **/
class deque {
  constructor() {
    this.len = 0;
    this.x = new Array(this.len);
  }

  appendleft(e) {
    var temp = new Array(this.len+1);
    temp[0] = e;
    for(var i = 0; i < this.len; i++) {
      temp[i+1] = this.x[i];
    }
    this.x = temp;
    this.len += 1;
  }

  pop() {
    if (this.len <= 0) {
      console.log('Pop element from empty queue');
      return null;
    }
    var temp = new Array(this.len-1);
    for(var i = 0; i < this.len-1; i++) {
      temp[i] = this.x[i];
    }
    this.len -= 1;
    var p = this.x[this.len];
    this.x = temp;
    return p;
  }

  isEmpty() {
    return (this.len == 0);
  }

  clear() {
    this.len = 0;
    this.x = new Array(this.len);
  }

  exists(block) {
    return this.x.includes(block);
  }

}

class Block {
  constructor(i, j, g_val=0, parent=null, w=grid_w, h=grid_h) {
    this.i = i; // row
    this.j = j; // column
    this.x = j * w; // width
    this.y = i * h; // height
    this.w = w;
    this.h = h;
    this.color = colors[0];
    this.parent = parent;
    this.f_val = 0;
    this.h_val = 0;
    this.g_val = g_val;

    if (Math.random() < dense) {
      this.color = colors[1];
    }
  }

  setColor(color) {
    this.color = color;
  }

  resetColor() {
    this.color = colors[Math.floor(Math.random() * 6)];
  }

  getGridPosition() {
    return [this.i, this.j];
  }

  getCoorordinatePosition() {
    return [this.x, this.y];
  }

  hash() {
    return 'r'+this.i+'c'+this.j;
  }

  isGoal() {
    if (this.i == rows-1 && this.j == cols-1) {
      return true;
    }
    return false;
  }

  path() {
    var p = new deque();
    p.appendleft(this);
    var node = this.parent;
    while (node != null) {
      p.appendleft(node);
      node = node.parent
    }
    return p.x;
  }

  generateNeighbors() {
    var arr = new deque();
    var tempBlock = new Block();
    if (this.i+1 < rows && blocks[this.i+1][this.j].color == 'white') {
      tempBlock = new Block(this.i+1, this.j, this.g_value()+1, this);
      arr.appendleft(tempBlock);
    }
    if (this.i-1 >= 0 && blocks[this.i-1][this.j].color == 'white') {
      tempBlock = new Block(this.i-1, this.j, this.g_value()+1, this);
      arr.appendleft(tempBlock);
    }
    if (this.j+1 < cols && blocks[this.i][this.j+1].color == 'white') {
      tempBlock = new Block(this.i, this.j+1, this.g_value()+1, this);
      arr.appendleft(tempBlock);
    }
    if (this.j-1 >= 0 && blocks[this.i][this.j-1].color == 'white') {
      tempBlock = new Block(this.i, this.j-1, this.g_value()+1, this);
      arr.appendleft(tempBlock);
    }
    return arr.x;
  }

  h_value(MODE=1) {
    switch (MODE) {
      case 0:
        // straight distance
        this.h_val = Math.sqrt((rows-this.i)*(rows-this.i)+(cols-this.j)*(cols-this.j));
        break;
      case 1:
        // manhatton distance
        this.h_val = rows-this.i+cols-this.j;
        break
      default:
        this.h_val = 0;
    }
    return this.h_val;
  }

  g_value() {
    return this.g_val;
  }

  f_value() {
    this.f_val = this.h_value() + this.g_value();
    return this.f_val;
  }
}

function create2DArray(rows, cols) {
  // rows * cols
  var x = new Array(rows);
  for (var i = 0; i < rows; i++) {
    x[i] = new Array(cols);
  }
  return x;
}

function initializeBlock() {
  for(var row = 0; row < rows; row++) {
    for(var col = 0; col < cols; col++) {
      blocks[row][col] = new Block(row, col, grid_w, grid_h);
    }
  }

  blocks[0][0].color = 'white';
  blocks[rows-1][cols-1].color = 'white';
}

function drawGrid() {
  for(var row = 1; row <= rows; row++) {
      c.beginPath();
      c.moveTo(0, grid_h * row);
      c.lineTo(grid_w * cols, grid_h * row);
      c.strokeStyle = 'black';
      c.stroke();
  }

  for(var col = 1; col <= cols; col++) {
    c.beginPath();
    c.moveTo(grid_w * col, 0);
    c.lineTo(grid_w * col, grid_h * rows);
    c.strokeStyle = 'black';
    c.stroke();
  }
}

function fillblocks() {
  for(var i = 0; i < rows; i++) {
    for(var j = 0; j < cols; j++) {
      var b = blocks[i][j];
      c.fillStyle = b.color;
      c.fillRect(b.x+1, b.y+1, b.w-2, b.h-2);
    }
  }
}

/*                  **
**  hashtable Class **
**                  **/

class hashtable {
  constructor() {
    this.len = 0
    this.keys = new Array(this.len);
    this.values = new Array(this.len);
  }

  put(key, value) {
    var Ktemp = new Array(this.len+1);
    var Vtemp = new Array(this.len+1);
    for(var i = 0; i < this.len; i++) {
      Ktemp[i] = this.keys[i];
      Vtemp[i] = this.values[i];
    }

    Ktemp[this.len] = key;
    Vtemp[this.len] = value;

    this.keys = Ktemp;
    this.values = Vtemp;
  }

  get(key) {
    if(this.keys.includes(key)) {
      var idx = this.keys.indexOf(key);
      return this.values[idx];
    } else {
      console.log('Key not found');
      return -1;
    }
  }

  exists(key) {
    return this.keys.includes(key);
  }
}

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

initializeBlock();
drawGrid();
fillblocks();

var queue = new priorityQueue();
var map = new hashtable();
queue.add(new Block(0, 0, grid_w, grid_h));

var next = null;

function dfs() {
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

    } else if (next != null) {
      var row = next.i;
      var col = next.j;
      var block = blocks[row][col];

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

dfs();
