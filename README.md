level-sync
==========

[![Build Status](https://travis-ci.org/jed/level-sync.svg)](https://travis-ci.org/jed/level-sync)

level-sync performs one-way sync between two [levelup][]-compatible data stores, by reading streamed data from both, merging the data into diff operations, and then writing those operations to the target store.

Example
-------

```javascript
import levelup from "levelup"
import memdown from "memdown"
import sync from "level-sync"

let hours = {
  old: {FRI: "10-7pm", SAT: "10-7pm"},
  new: {SAT: "10-7pm", SUN: "10-7pm"}
}

let local = levelup("", {db: memdown})
let remote = levelup("", {db: memdown})

for (let day in hours.old) remote.put(day, hours.old[day])
for (let day in hours.new) local.put(day, hours.new[day])

let ops = sync(local, remote)

ops.on("data", console.log)
// { type: 'del', key: 'FRI' }
// { type: 'put', key: 'SUN', value: '10-7pm' }

ops.on("end", () => remote.createReadStream().on("data", console.log))
// { key: 'SAT', value: '10-7pm' }
// { key: 'SUN', value: '10-7pm' }
```

Installation
------------

    npm install level-sync

API
---

### let rs = sync(from, to, options)

Syncs data from the `from` store to the `to` store. This works by reading in both stores, diffing them into operations, and then writing the operations to the `to` store, as well as emitting them to the returned readable stream. If the `dryRun` property of the optional `options` object is true, the operations are only emitted, and not written to the target store.

[levelup]: https://github.com/rvagg/node-levelup
