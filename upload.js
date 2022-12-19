'use strict';

import http from 'node:http';
import formidable from 'formidable';
import fs from 'node:fs';

const PORT = 3444;
const HOST = '192.168.1.190';
let server = http.createServer;

server = http.createServer((req, res) => {
    console.log('url', req.url);
    // Print something interesting about the client

    if (req.url === '/upload' && req.method.toUpperCase() === 'POST') {

        let form = formidable({ multiples: true });
        form.parse(req, (error, fields, files) => {
            if (files.size <= 0) return;
            if (error) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(String(error));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify({ error, fields, files }, null, 2));

            console.log('\n');

            if (!Array.isArray(files.fileupload))
                files.fileupload = [ files.fileupload ];
            files.fileupload.forEach(file => {
                let info = `> Uploaded ${file.originalFilename} at ${file.filepath}`;
                console.log(info);
                res.write(info);

                fs.mkdirSync('/tmp/from-upload'); // it will throw an error if this folder already exists (and for other reasons as well). That should not be the problem when run for the first time.
                fs.rename(file.filepath, `/tmp/from-upload/${file.originalFilename}`, function renameError(err) {
                    if (err) {
                        throw err;
                    }

                    console.log('Moved!');
                });
            });

            res.end();
        });

        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile('./index.html', (err, index) => {
        if (err) {
            console.error(err);
            return;
        }

        res.end(index.toString());
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Listening at http://${HOST}:${PORT}`);
    let address = server.address();
    console.log(address);
});
