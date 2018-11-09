// Yuoa
// Program constants

import os from "os";
import path from "path";

// [String]
export const APPNAME = "My Little Wallet";
export const APPNAME_ABBR = "mlw";

// [Path]
// NOTE: To point a file/dir in this program, USE RELATIVE PATH
export const DIR_LOG = path.join(os.homedir(), ".mlw", "log");
export const FILE_LOG = "wallet.log";

// [Argument Parsing]
export const APP_DEFFUNC = "web";
export const APP_FUNC = {
    web: {
        keyword: "web",
        description: "Launch web wallet.",
        options: ["port", "ipc"]
    }
};
export const APP_OPT = {
    port: {
        flags: ["--port", "-p"],
        type: "ARGOPT_WITH_DATA",
        description: "Start web wallet to given port."
    },
    ipc: {
        flags: ["--ipc", "-i"],
        type: "ARGOPT_WITH_DATA",
        description: "Connect to geth with given ipc.",
        required: true
    }
};

