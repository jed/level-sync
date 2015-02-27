"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var stream = _interopRequire(require("stream"));

var deepEqual = _interopRequire(require("deep-equal"));

var OrderedKVTupleStream = _interopRequire(require("ordered-kv-tuple-stream"));

var DiffStream = function (from, to) {
  var tuples = OrderedKVTupleStream({
    from: from.createReadStream(),
    to: to.createReadStream()
  });

  var transform = stream.Transform({
    objectMode: true,
    transform: function transform(_ref, enc, cb) {
      var key = _ref.key;
      var _ref$value = _ref.value;
      var from = _ref$value.from;
      var to = _ref$value.to;

      if (!from) cb(null, { type: "del", key: key });else if (deepEqual(from, to)) cb();else cb(null, { type: "put", key: key, value: from });
    }
  });

  return tuples.pipe(transform);
};

var sync = function (from, to) {
  var options = arguments[2] === undefined ? {} : arguments[2];

  var rs = DiffStream(from, to);

  if (options.dryRun) return rs;

  var pt = stream.PassThrough({ objectMode: true });
  var ws = rs.pipe(to.createWriteStream());

  ws.on("error", function (err) {
    return pt.emit("error", err);
  });
  ws.on("close", function () {
    return pt.push(null);
  });

  return rs.pipe(pt, { end: false });
};

module.exports = sync;

