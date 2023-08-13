const { Buffer } = require('buffer')

class Counter {
    constructor(id) {
        this.id = id
        this.value = 0
        this.time = 0
    }

    step() {
        this.time++
    }

    inc() {
        this.value++
        this.step()
    }

    dec() {
        this.value--
        this.step()
    }

    getId() {
        return this.id
    }

    getValue() {
        return this.value
    }

    getTime() {
        return this.time
    }

    merge(o) {
        if (o.time > this.time || (o.time === this.time && o.value > this.value)) {
            console.log("Merged to the value of counter:" + o.id)
            console.log("Updated value:" + o.value)
            this.value = o.value
            this.time = o.time
        } else {
            console.log("Update not required")
        }
    }

    print() {
        return `Counter_${this.id}:${this.value}:${this.time}`
    }

    print() {
        return `Counter_${this.id}:${this.value}:${this.time}`
    }

    toByteArray() {
        const buffer = Buffer.alloc(12)
        buffer.writeUInt32LE(this.id, 0)
        buffer.writeInt32LE(this.value, 4)
        buffer.writeUInt32LE(this.time, 8)
        return buffer
    }

    fromByteArray(buffer) {
        const id = buffer.readUInt32LE(0)
        const value = buffer.readInt32LE(4)
        const time = buffer.readUInt32LE(8)

        let tmp = new Counter(id)
        tmp.value = value
        tmp.time = time
        return tmp
    }
}

module.exports = Counter
