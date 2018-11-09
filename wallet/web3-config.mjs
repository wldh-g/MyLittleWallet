// (c) Yuoa
// Configuring web3.js library

export default async (arg, log, e) => {
    const Web3 = (await import("web3")).default;
    const net = (await import("net")).default;

    // Get connection path
    log.info(`Geth IPC path: ${arg.ipc}`);

    return new Promise (ok => ok(new Web3(arg.ipc, net)))
        .catch(e.parse(0x200, "Error occurred while initializing web3.js."));
};

