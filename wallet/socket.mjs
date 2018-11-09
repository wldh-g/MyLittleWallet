// (c) Yuoa

import iter from "../util/iterate.mjs";

export const bind = (log, e, web3, io) => {

    var eventSoc = {};
    var watchingAcc = {};
    var isFirstWatch = true;
    const checkInterval = 2000;

    // Bind socket connection
    io.on('connection', (soc) => {
        log.info("Gathering accounts...", "Connecting...");

        // Initialize event emitter
        eventSoc[soc.id] = soc;

        // Send initialization
        web3.eth.getAccounts().then(accounts => {
            if (accounts.length == 0)
                return {};
            else
                return iter(accounts, item => 
                    (ok, no) =>
                        web3.eth.getBalance(item).then(balance => {
                            ok([item, Number(balance / Number(web3.utils.unitMap.ether))])
                        })
                    );
        }).then(balances => {
            log.debug(balances, "Connected");
            soc.emit("init", balances);
        });

        // Send gas price
        web3.eth.getGasPrice().then(gp => {
            var gweiGasPrice = web3.utils.fromWei(gp, "gwei");
            log.debug(gweiGasPrice, "Gas Price Uploaded")
            soc.emit('gpUpdate', gweiGasPrice);
        });

        // When disconnected
        soc.on('disconnect', () => {
            log.warn("Disconnected.");

            // Remove socket from event emitter
            delete eventSoc[soc.id];
        });

        // When user tries to send a transaction
        soc.on('send', (txData) => {
            var txPassword = txData.pwd;
            delete txData.pwd;
            log.debug(txData, "Sending - Pending");
            soc.emit("txStatus", "Unlocking Account...");
            web3.eth.personal.unlockAccount(txData.tm, txPassword)
                .catch(_ => {
                    return false;
                })
                .then((res) => {
                    if (res === false) {
                        var data = { state: false, reason: "Wrong password" };
                        log.error(JSON.stringify(data), "Sending - Failed");
                        soc.emit('txResult', data);
                    } else {
                        var inWei = web3.utils.toWei(txData.val);
                        var estimatedGas = 0;
                        soc.emit('txStatus', "Estimating Gas...");
                        web3.eth.estimateGas({
                            to: txData.rp,
                            amount: inWei
                        }).then(gas => {
                            estimatedGas = gas;
                            return web3.eth.getGasPrice();
                        }).then(gasPrice => {
                            estimatedGas *= gasPrice;
                            return web3.eth.getBalance(txData.tm);
                        }).then(balance => {
                            if (Number(inWei) + Number(estimatedGas) < Number(balance)) {
                                soc.emit("txStatus", "Sending Transaction...");
                                // Make Transaction
                                web3.eth.sendTransaction({
                                    from: txData.tm,
                                    to: txData.rp,
                                    value: inWei
                                }).on('transactionHash', _ => {
                                    var data = { state: true };
                                    log.success(JSON.stringify(data), "Sending - Successful");
                                    soc.emit('txResult', data);
                                }).catch(error => {
                                    soc.emit("txResult", { state: false, reason: "Unknown Error" });
                                    e.parse(0x600, "Unknown error occurred")(error);
                                });
                            } else {
                                // Refuse
                                var data = { state: false, reason: "Lack of balance" };
                                log.error(JSON.stringify(data), "Sending - Failed");
                                soc.emit('txResult', data);
                            }
                        }).catch(error => {
                            soc.emit("txResult", { state: false, reason: "Unknown Error" });
                            e.parse(0x500, "Unknown error occurred")(error);
                        });
                    }
                }).catch(error => {
                    soc.emit("txResult", { state: false, reason: "Unknown Error" });
                    e.parse(0x300, "Unknown error occurred")(error);
                });
        });
    });

    // Manage account list and make event listener
    var checkAccount = function () {
        if (Object.keys(eventSoc).length) {
            log.info("Checking account changes...", "Watching");
            web3.eth.getAccounts().then(accounts =>
                iter(accounts, item =>
                    (ok, no) =>
                        web3.eth.getBalance(item).then(balance => {
                            ok([item, Number(balance / Number(web3.utils.unitMap.ether))])
                        })
                )
            ).then(balances => {
                if (balances && !isFirstWatch) {
                    log.info("Upload balance information...", "Watching");
                    for (var i in eventSoc) {
                        eventSoc[i].emit("update", balances);
                    }
                }
                isFirstWatch = false;
                setTimeout(checkAccount, checkInterval);
            }).catch(e.parse(0x400, "Unknown error occurred in watching")); 
        } else
            setTimeout(checkAccount, checkInterval);
    };
    checkAccount();
};
