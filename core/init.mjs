// (c) Yuoa
// Program initializing

import path from "path";
import exit from "./exit.mjs";
import YError from "./error.mjs";
import YLog from "./log.mjs";
import * as arhe from "./arghelp.mjs";
import * as cs from "./const.mjs";
import * as json from "../util/json.mjs";

export var log = new YLog(cs.APPNAME_ABBR, cs.DIR_LOG, cs.FILE_LOG);
export var e = new YError(log);
export var pkg, arg;

export var init =
    // Read "package.json"
    json.parse(
        path.resolve("package.json")
    ).then(parsedPkg => {
        pkg = parsedPkg;
        return arhe.parse(e);
    }, e.parse(0x110, "Fatal error occurred while parsing 'package.json'.", true))

    // If no arguments, or want, display help
    .then(analyzedArg => {
        arg = analyzedArg;

        if (arg.fn.keyword == "help")
            return arhe
                .help(arg, pkg, log)
                .then(exit(0))
                .catch(
                    e.parse(
                        0x140,
                        "Fatal error occurred while printing help message.",
                        true
                    )
                );
        else return "❤";
    }, e.parse(0x120, "Fatal error occurred while parsing arguments.", true))

    // Wait for 5 ticks and start program
    .then(_ => {
        // Wait 50 ticks for safely load log module
        return new Promise(ok => setTimeout(ok, 200));
    }, e.parse(0x100, "Fatal error from unknown cause.", true));

