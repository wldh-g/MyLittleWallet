#!/usr/bin/env -S node --experimental-modules

// (c) Yuoa

import {init, log, e, pkg, arg} from "./core/init.mjs";
import openWebWallet from "./wallet";

init.then(() => {
    switch (arg.fn.keyword) {

        case "web":
        return openWebWallet(arg, log, e);

    }
})
.catch(e.parse(0x200, "Unknown error occurred while executing some code segments."));

