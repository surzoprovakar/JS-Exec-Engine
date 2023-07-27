var Counter = require('./counter')
const net = require('net')

var wait = (ms) => {
    const start = Date.now()
    let now = start
    while (now - start < ms) {
        now = Date.now()
    }
}


var id = process.argv[2]
let c = new Counter(id.toString())


for (var i = 0; i < 10; i++) {
    const updateType = Math.random() < 0.5 ? '+' : '-'
    const updateValue = Math.floor(Math.random() * 4)
    if (updateType === '+') {
        c.inc(updateValue)
    } else if (updateType === '-') {
        c.dec(updateValue)
    }
    console.log("Cureent Value:" + c.value)
    wait(1000)
}


const client = net.connect({ port: 3000 }, () => {
    console.log('Connected to server.');
    // client.write(data.toString().trim());
});

client.on('data', (data) => {
    const value = data.toString().trim();
    console.log(`Received value from server: ${value}`);
    const [o_id, o_val] = value.split(':');
    c.merge(o_id, parseInt(o_val));
    console.log('End value of ' + c.id + ': ' + c.value);
});

client.on('end', () => {
    console.log('Disconnected from server.');
});

client.on('error', (err) => {
    console.error('Socket error:', err);
});

console.log("Press any key to send value to other replicas")
process.stdin.on('data', (data) => {
    const content = c.id.toString() + ':' + c.value.toString();
    console.log('Sending the value to others:' + content);
    client.write(content.toString().trim());
});