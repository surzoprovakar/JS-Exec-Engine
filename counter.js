const { Buffer } = require('buffer')

class Mutex {
    constructor() {
        this.locked = false
    }

    lock() {
        if (!this.locked) {
            this.locked = true
            return true
        } else {
            return false
        }
    }

    unlock() {
        this.locked = false
    }
}

const mutex = new Mutex()

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
        mutex.lock()
        this.value++
        this.step()
        mutex.unlock()
    }

    dec() {
        mutex.lock()
        this.value--
        this.step()
        mutex.unlock()
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
        mutex.lock()
        if (o.time > this.time || (o.time === this.time && o.value > this.value)) {
            console.log("Merged to the value of counter:" + o.id)
            console.log("Updated value:" + o.value)
            this.value = o.value
            this.time = o.time
        } else {
            console.log("Update not required")
        }
        mutex.unlock()
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
