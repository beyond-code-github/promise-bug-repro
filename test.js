const test = require("tape");

async function chain(iterator, cancelAccessorF) {
    let rejectCurrent = () => {};

    if (cancelAccessorF) {
        cancelAccessorF(e => rejectCurrent(e));
    }

    for (const p of iterator) {
        await new Promise((resolve, reject) => {
            p.then(result => resolve(result));
            rejectCurrent = reject
        });
    }
}

test("Executing a promise chain from a generator", async assert => {
    const {messages, resolvers, promises, promiseGenerator} = setup();

    chain(promiseGenerator()).finally(() => {
        assert.deepEqual(messages, ["Before promise 1", "Before promise 2", "Before promise 3", "After final promise"]);
        assert.end()
    });

    assert.deepEqual(messages, ["Before promise 1"]);

    resolvers[0]();
    await promises[0];

    assert.deepEqual(messages, ["Before promise 1", "Before promise 2"]);

    resolvers[1]();
    await promises[1];

    assert.deepEqual(messages, ["Before promise 1", "Before promise 2", "Before promise 3"]);

    resolvers[2]();
});

test("Cancelling a promise chain from a generator", async assert => {
    const {messages, resolvers, promises, promiseGenerator} = setup();

    let cancel = () => {};
    chain(promiseGenerator(), c => cancel = c).finally(() => {
        assert.deepEqual(messages, ["Before promise 1", "Before promise 2"]);
        assert.end()
    });

    resolvers[0]();
    await promises[0];

    cancel()
});

function setup() {
    const messages = [];
    const resolvers = [];
    const promises = [
        new Promise(resolve => resolvers.push(resolve)),
        new Promise(resolve => resolvers.push(resolve)),
        new Promise(resolve => resolvers.push(resolve))
    ];

    function* promiseGenerator() {
        messages.push("Before promise 1");
        yield promises[0];
        messages.push("Before promise 2");
        yield promises[1];
        messages.push("Before promise 3");
        yield promises[2];
        messages.push("After final promise");
    }

    return {messages, resolvers, promises, promiseGenerator};
}
