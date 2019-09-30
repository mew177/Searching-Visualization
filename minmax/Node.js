var MAXPLAYER = 1;
var MINPLAYER = 0;

class Node {

  constructor(player, level, index, i, parent=null, val=null) {
    this.val = val;
    this.parent = parent;
    this.role = player;
    this.i = i;
    this.level = level;
    this.index = index;
    this.visited = false;
    this.color = 'black';
    this.from = null;
  }

  visit() {
    this.visited = true;
    this.color = 'red';
  }

  // deliver value from children to parent
  toParent() {
    if (this.parent != null) {
      if ((this.parent.val == null) ||
          (this.parent.role == MAXPLAYER && this.val > this.parent.val) ||
          (this.parent.role == MINPLAYER && this.val < this.parent.val)) {
        // 0. if parent's value hasn't been set
        // 1. if parent is a max player and value is larger than parent's value
        // 2. if parent is a min player and value is smaller than parent's value
        //console.log('set parent on level:', this.parent.level, 'index', this.parent.index, 'value -> ', this.val);
        this.parent.val = this.val;
        this.parent.from = this;
      }
    }
  }

  // whether keep tracking or not
  keepTracking() {
    // if this node is not root node
    if (this.parent != null) {
      if ((this.role == MAXPLAYER && this.val > this.parent.val) ||
          (this.role == MINPLAYER && this.val < this.parent.val)) {
        // 1. if this is a max player
        //    if this node value is larger then parent's => keep tracking
        //    this node value is smaller then parent's => keep tracking
        // 2. if this is a min player
        //    if this node value is smaller then parent's => keep tracking
        //    this node value is larger then parent's => prune children nodes
        return true;
      }
    }
    return false;
  }

  // return path to root
  path() {
    var paths = [this];
    var node = this;
    while(node.from != null) {
      paths.push(node.from);
      console.log('push', node.from);
      node = node.from;
    }
    return paths;
  }

}
