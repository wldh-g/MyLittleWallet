// (c) Yuoa
// Ethereum web wallet

import express from "express";
import socket from "socket.io";
import path from "path";
import http from "http";
import * as socset from "./socket.mjs";

export default class {

    constructor(log, e, port) {
        if (!isNaN(Number(port)))
            this.port = Number(port);
        else
            this.port = 8000;

        this.log = log;
        this.e = e;
        this.w3 = null;
    }

    start(web3) {
        this.w3 = web3;
        var log = this.log;

        // Load express and basic configuration
        const app = express();
        app.set("etag", "strong");
        app.disable("x-powered-by");

        // Bind static web channel
        app.use(express.static(path.dirname(new URL(import.meta.url).pathname) + "/html"));

        // Start web wallet
        const sv = app.listen(this.port, () => {

            log.info(`Web wallet service started on port ${this.port}.`);

        });

        // Bind websocket
        const io = new socket(sv);
        socset.bind(this.log, this.e, web3, io);
    }

};
