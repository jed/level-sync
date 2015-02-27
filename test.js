import {deepEqual} from "assert"
import levelup from "levelup"
import memdown from "memdown"
import concat from "concat-stream"
import sync from "./level-sync"

let hours = {
  old: {FRI: "10-7pm", SAT: "10-7pm"},
  new: {SAT: "10-7pm", SUN: "10-7pm"}
}

let local = levelup("", {db: memdown})
let remote = levelup("", {db: memdown})

for (let day in hours.old) remote.put(day, hours.old[day])
for (let day in hours.new) local.put(day, hours.new[day])

let checkDiff = concat(diff => deepEqual(diff, [
  {type: "del", key: "FRI"},
  {type: "put", key: "SUN", value: "10-7pm"}
]))

let checkRemote = concat(rows => deepEqual(rows, [
  {key: "SAT", value: "10-7pm"},
  {key: "SUN", value: "10-7pm"}
]))

let ops = sync(local, remote)

ops.pipe(checkDiff)
ops.on("end", () => remote.createReadStream().pipe(checkRemote))
