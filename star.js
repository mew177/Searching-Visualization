var canvas = document.querySelector('canvas');

// canvas location and attribute
var win_width = window.innerWidth;
var win_height = 620;
canvas.width = win_width;
canvas.height = window.innerHeight;
canvas.style.top = window.innerHeight-win_height + "px";
canvas.style.position = "absolute";

var colors = ['white', 'black', 'red', 'yellow', 'green', 'blue'];
var dense = 0.35

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
      if(e.f <= this.x[i].f) {
        temp[i] = this.x[i];
        idx = i;
      } else {
        temp[i+1] = this.x[i];
      }
    }

    temp[idx+1] = e;
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
  constructor(i, j, w, h) {
    this.i = i; // row
    this.j = j; // column
    this.x = j * w; // width
    this.y = i * h; // height
    this.w = w;
    this.h = h;
    this.color = colors[0];
    this.parent = null;
    this.f = 0;

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

  generateNeighbors(rows, cols) {
    var arr = new deque();
    if (this.i+1 < rows) {
      arr.appendleft(blocks[this.i+1][this.j])
    }
    if (this.i-1 >= 0) {
      arr.appendleft(blocks[this.i-1][this.j])
    }
    if (this.j+1 < cols) {
      arr.appendleft(blocks[this.i][this.j+1])
    }
    if (this.j-1 >= 0) {
      arr.appendleft(blocks[this.i][this.j-1])
    }
    return arr.x;
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

var grid_w = 20;
var grid_h = 20;
var rows = Math.floor(win_height / grid_w);
var cols = Math.floor(win_width / grid_h);
var blocks = create2DArray(cols, rows);

var c = canvas.getContext('2d');

function initializeBlock() {
  for(var row = 0; row < rows; row++) {
    for(var col = 0; col < cols; col++) {
      blocks[row][col] = new Block(row, col, grid_w, grid_h);
    }
  }

  // fill unreachable blocks
  for(var i = 0; i < rows; i++) {
    for(var j = 0; j < cols; j++) {
      var b = blocks[i][j];
      var neighbors = b.generateNeighbors(rows, cols);
      if (neighbors.length == 0) {
        b.setColor('black');
      }
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
      return null;
    }
  }

  exists(key) {
    return this.keys.includes(key);
  }
}

function hash(key) {
  var x = key[0];
  var y = key[1];
  return "r" + x + 'c' + y;
}

function drawPath(paths) {
  c.beginPath();
  c.moveTo((grid_h/2), (grid_w/2));
  for (var i = 0; i < paths.length ; i++) {
    var node = paths;
    console.log(paths[i])
    c.lineTo(paths[i].x+(grid_h/2), paths[i].y+(grid_w/2));
  }
  c.strokeStyle = 'red';
  c.lineWidth = 5;
  c.stroke();

}

initializeBlock();

var queue = new deque();
var map = new hashtable();
queue.appendleft(blocks[0][0]);

function dfs() {
  requestAnimationFrame(dfs);

  if (queue.len > 0) {
    var next = queue.pop();
    if (next.isGoal()) {
      next.setColor('yellow');
      queue.clear();

    } else if (next != null && !map.exists(next.hash())) {
      var row = next.i;
      var col = next.j;
      var block = blocks[row][col]

      map.put(next.hash(), block);
      block.setColor('yellow');

      if (row+1 < rows && !queue.exists(blocks[row+1][col]) && blocks[row+1][col].color == 'white') {
        blocks[row+1][col].parent = next;
        queue.appendleft(blocks[row+1][col]);
      }

      if (col+1 < cols && !queue.exists(blocks[row][col+1]) && blocks[row][col+1].color == 'white') {
        blocks[row][col+1].parent = next;
        queue.appendleft(blocks[row][col+1]);
      }

      if (row-1 >= 0 && !queue.exists(blocks[row-1][col]) && blocks[row-1][col].color == 'white') {
        blocks[row-1][col].parent = next;
        queue.appendleft(blocks[row-1][col]);
      }

      if (col-1 >= 0 && !queue.exists(blocks[row][col-1]) && blocks[row][col-1].color == 'white') {
        blocks[row][col-1].parent = next;
        queue.appendleft(blocks[row][col-1]);
      }
    }

    c.clearRect(0, 0, win_width, win_height);
    drawGrid();
    fillblocks();
    drawPath(next.path());

  }
}

dfs();
