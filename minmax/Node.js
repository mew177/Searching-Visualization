var MAXPLAYER = 1;
var MINPLAYER = 0;

class Node {

  constructor(player, level, index, parent=null, val=null) {
    this.val = val;
    this.parent = parent;
    this.role = player;
    this.level = level;
    this.index = index;

    this.visited = false;
    this.color = 'black';
    this.from = null;
    this.children = [];
    this.orgVal = val;
  }

  visit() {
    if (this.visited) {
      return true;
    }

    this.visited = true;
    this.color = 'red';
    return false;
  }

  // deliver value from children to parent
  toParent() {
    if (this.parent != null) {
      if (this.parent.val == null) {
        // 0. if parent's value hasn't been set
        this.parent.val = this.val;
        this.parent.from = this;
      } else if (this.parent.role == MAXPLAYER && this.val > this.parent.val) {
        // 1. if parent is a max player and value is larger than parent's value
        this.parent.val = this.val;
        this.parent.from = this;
      } else if (this.parent.role == MINPLAYER && this.val < this.parent.val) {
        this.parent.val = this.val;
        this.parent.from = this;
      }
    }
  }

  hasUnvisitedChildren() {
    for (var i = 0; i < this.children.length; i++) {
      if (!this.children[i].visited) {
        return true;
      }
    }
    return true;
  }

  checkMyState() {
    if (!this.hasUnvisitedChildren()) {
      for (var i = 0; i < this.children.length; i++) {
        if (this.role == MINPLAYER) {
          this.val = Math.min(this.children[i].val, this.val);
        } else {
          this.val = Math.max(this.children[i].val, this.val);
        }
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
      node = node.from;
    }
    return paths;
  }

}
