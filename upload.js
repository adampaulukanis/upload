"use strict";

import http from "node:http";
import formidable from "formidable";
import fs from "node:fs";

const PORT = 3444;
const HOST = 'localhost';
let server = http.createServer;

server = http.createServer((req, res) => {
    console.log("url", req.url);
    // Print something interesting about the client

    if (req.url === "/upload" && req.method.toUpperCase() === "POST") {
        let form = formidable({
            multiples: true,
            uploadDir: "./uploaded",
            maxFileSize:  25 * 1024 * 1024
        });
        form.on("error", (error) => {
            console.log("eeeeeeeeeeeeeeeeeeeeeeee-start");
            console.error(error);
            console.log("eeeeeeeeeeeeeeeeeeeeeeee-stop");
        })
        form.parse(req, (error, fields, files) => {
            if (files.size <= 0) return;
            if (error) {
                console.log("------error in parse() start-------");
                console.error(error);
                console.log("------error in parse() stop-------");
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(String(error));
                return;
            }

            res.writeHead(200, { "Content-Type": "text/plain" });
            res.write(JSON.stringify({ error, fields, files }, null, 2));

            console.log("\n");

            if (!Array.isArray(files.fileupload)) {
                files.fileupload = [ files.fileupload ];
            }
            files.fileupload.forEach(file => {
                let info = `> Uploaded ${file.originalFilename} at ${file.filepath}`;
                console.log(info);
                res.write(info);

                fs.rename(file.filepath, `./uploaded/${file.originalFilename}`, function renameError(err) {
                    if (err) {
                        console.log("Error while renaming files");
                        throw err;
                    }

                    console.log("Moved!");
                });
            });

            res.end();
        });

        return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.readFile("./index.html", (err, index) => {
        if (err) {
            console.error(err);
            return;
        }

        res.end(index.toString());
    });
});

server.listen(PORT, () => {
    console.log(`Listening at http://${HOST}:${PORT}`);
    let address = server.address();
});

server.timeout = 6000 * 60 * 60; // 60 mins
//server.timeout = 0;
