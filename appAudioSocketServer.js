import fs from 'fs';
import express from 'express'

const app = express()

app.get('/', function(req,res) {
  let file = "./sample.wav";

  fs.stat(file, function(err,stats){

    var start, end;
    var total = stats.size;

    var range = req.headers.range;
    if(range) {
      var positions = range.replace(/bytes=/, "").split("-");
      start = parseInt(positions[0], 10);
      end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    } else {
      start = 0;
      end = total - 1;
    }
    var chunksize = (end - start) + 1;

    res.writeHead(200, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      //"Content-Type": "audio/mpeg"
      "Content-Type": "audio/wav"
    });

    var stream = fs.createReadStream(file, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      }).on("error", function(err) {
        res.end(err);
      });
  })
})

app.listen(10500).on('listening', () => {
  console.log('Listening on port 10500');
})
