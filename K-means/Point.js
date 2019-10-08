class Point {
    constructor(x, y, group=0, isCenter=false) {
        this.x = x;
        this.y = y;
        this.group = group;
        this.isCenter = isCenter;
    }

    setGroup(group) {
        this.group = group;
    }
}