
class Rectangle {
    constructor(
        public left?: number,
        public top?: number,
        public width?: number,
        public height?: number) {
    }

    get right(): number {
        return this.left + this.width;
    }

    get bottom(): number {
        return this.top + this.height;
    }

    intersect(other: Rectangle): Rectangle {
        var x = Math.max(this.left, other.left),
            num1 = Math.min(this.left + this.width, other.left + other.width),
            y = Math.max(this.top, other.top),
            num2 = Math.min(this.top + this.height, other.top + other.height);
        if (num1 >= x && num2 >= y)
            return new Rectangle(x, y, num1 - x, num2 - y);
        else
            return Rectangle.empty;
    }

    static get empty(): Rectangle {
        return this._empty;
    }
    private static _empty: Rectangle = new Rectangle(0, 0, 0, 0);
}

export = Rectangle;