class Counter {
    constructor(id) {
        this.id = id
        this.value = 0
    }
    inc(val) {
        console.log("added by ", val)
        this.value += val
    }
    dec(val) {
        console.log("deducted by ", val)
        this.value -= val
    }
    print() {
        console.log(this.name, ": value is ", this.value)
    }
    // merge(sender) {
    //     if (this.value < sender.value) {
    //         this.value = sender.value
    //         console.log("Merged from replica " + other.id + " to value:" + this.value)
    //     }
    // }
    merge(o_id, o_value) {
        // console.log("this val" + this.value)
        // console.log("other val" + o_value)
        if (this.value < o_value) {
            this.value = o_value
            console.log("Merged to value:" + this.value + " of replica:" + o_id)
        }
        else {
            console.log("Not updated")
            console.log(this.value)
        }
    }
}

module.exports = Counter