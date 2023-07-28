class Counter {
    constructor(id) {
        this.id = id;
        this.value = 0;
        this.time = 0;
    }

    step() {
        this.time++;
    }

    inc() {
        this.value++;
        this.step();
    }

    dec() {
        this.value--;
        this.step();
    }

    merge(o) {
        if (o.time > this.time || (o.time === this.time && o.value > this.value)) {
            this.value = o.value;
            this.time = o.time;
        }
    }

    print() {
        return `Counter_${this.id}:${this.value}:${this.time}`;
    }

    toByteArray() {
        const buffer = Buffer.alloc(12);
        buffer.writeUInt32LE(this.id, 0);
        buffer.writeInt32LE(this.value, 4);
        buffer.writeUInt32LE(this.time, 8);
        return buffer;
    }
}

module.exports = Counter