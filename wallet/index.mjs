// (c) Yuoa

import w3c from "./web3-config.mjs";
import WebService from "./web.mjs";

export default (arg, log, e) => {

    var ws = new WebService(log, e, arg.port);
    w3c(arg, log, e).then(_ => ws.start(_));

};
