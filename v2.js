exports = module.exports = V2;

class V2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    addX(vec) {
        this.x += vec.x;
        return this;
    }

    addY(vec) {
        this.y += vec.y;
        return this;
    }

    add(vec) {
        this.addX(vec.x);
        this.addY(vec.y);
        return this;
    }

    subtractX(vec) {
        this.x -= vec.x;
        return this;
    }

    subtractY(vec) {
        this.y -= vec.y;
        return this;
    }

    subtract(vec) {
        this.subtractX(vec.x);
        this.subtractY(vec.y);
        return this;
    }

    addScalar(scalar) {
        this.addX(scalar);
        this.addY(scalar);
        return this;
    }

    addScalarX(scalar) {
        this.addX(scalar);
        return this;
    }

    addScalarY(scalar) {
        this.addY(scalar);
        return this;
    }

    subtractScalar(scalar) {
        this.subtractX(scalar);
        this.subtractY(scalar);
        return this;
    }

    subtractScalarX(scalar) {
        this.subtractX(scalar);
        return this;
    }

    subtractScalarY(scalar) {
        this.subtractY(scalar);
        return this;
    }

    // Multiply

    // Divide


    invertX() {
        this.x *= -1;
        return this;
    }

    invertY() {
        this.x *= -1;
        return this;
    }

    invert() {
        this.invertX();
        this.invertY();
        return this;
    }

    norm() {
        const length = this.length();
        if (!length) {
            this.x = 1;
            this.y = 0;
        } else {
            this.divide(new V2(length, length));
        }
        return this;
    }
}
