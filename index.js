import stream from "stream"
import deepEqual from "deep-equal"
import OrderedKVTupleStream from "ordered-kv-tuple-stream"

const DiffStream = (from, to) => {
  let tuples = OrderedKVTupleStream({
    from: from.createReadStream(),
    to: to.createReadStream()
  })

  let transform = stream.Transform({
    objectMode: true,
    transform({key, value: {from, to}}, enc, cb) {
      if (!from) cb(null, {type: "del", key})

      else if (deepEqual(from, to)) cb()

      else cb(null, {type: "put", key, value: from})
    }
  })

  return tuples.pipe(transform)
}

const sync = (from, to, options = {}) => {
  let rs = DiffStream(from, to)

  if (options.dryRun) return rs

  let pt = stream.PassThrough({objectMode: true})
  let ws = rs.pipe(to.createWriteStream())

  ws.on("error", err => pt.emit("error", err))
  ws.on("close", () => pt.push(null))

  return rs.pipe(pt, {end: false})
}

export default sync
