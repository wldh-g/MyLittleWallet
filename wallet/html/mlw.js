// (c) Yuoa
window.onload = function() {
    // If IE, show not-supported alert
    var agent = navigator.userAgent.toLowerCase();
    if ((navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1))
        document.getElementById("not_supported").style.opacity = 1;
    else {
        // This saves each element
        const accTable = document.getElementById("acc_table");
        const slOption = document.getElementById("acc_select");
        const bgAudio = document.getElementById("back_audio");
        const bgVideo = document.getElementById("back_video");
        const loadPage = document.getElementById("initial_load");
        const status = document.getElementById("status");
        const rpDataList = document.getElementById("rpList");
        const gasPrice = document.getElementById("gas_price");

        // Page variable
        var statusTimeout;
        var acMap = [];

        // This opens site
        var pageOpen = function () {
            bgAudio.play();
            loadPage.style.setProperty("opacity", 0);
            setTimeout(function () {
                loadPage.style.setProperty("z-index", -1);
            }, 1000);
            window.onclick = function () {
                bgAudio.play();
                bgVideo.play();
            };
        };
        
        // This closes site
        var pageClose = function () {
            window.onclick = function () {};
            loadPage.style.setProperty("z-index", null);
            loadPage.style.setProperty("opacity", 1);
            bgAudio.pause();
        };

        // Update status
        var updateStatus = function (message, pop, willDie) {
            clearTimeout(statusTimeout);
            status.classList.remove("statusChanged");
            status.style.setProperty("opacity", 1);
            status.textContent = message;
            if (pop !== false)
                status.classList.add("statusChanged");
            if (willDie !== false)
                statusTimeout = setTimeout(function () {
                    status.style.setProperty("opacity", 0);
                    statusTimeout = setTimeout(function () {
                        status.textContent = "";
                        status.classList.remove("statusChanged");
                    }, 1000);
                }, 3000);
        };

        // This updates account-balance table
        var updateList = function(a, h) {
            if (typeof a === "object") { // If data is valid
                var diffList = [];

                // Process all lists
                for (var i in a) {
                    var found = document.getElementById("ac_" + i);

                    // If no row found
                    if (found == null) {
                        // Account count map
                        acMap.push(i);

                        // Account No
                        var tdN = document.createElement("td");
                        tdN.textContent = acMap.length;

                        // Account
                        var tdA = document.createElement("td");
                        tdA.textContent = i;

                        // Balance
                        var tdB = document.createElement("td");
                        tdB.textContent = a[i];

                        // Row
                        var tr = document.createElement("tr");
                        tr.id = "ac_" + i;
                        tr.appendChild(tdN);
                        tr.appendChild(tdA);
                        tr.appendChild(tdB);

                        accTable.appendChild(tr);

                        // Add send transmitter optoin
                        var sl = document.createElement("option");
                        sl.innerHTML = acMap.length + " - " + i + " - " + a[i] + " eth";
                        sl.id = "tm_" + i;

                        slOption.appendChild(sl);
                        diffList.push(i);

                        // Add to recipient list
                        var ro = document.createElement("option");
                        ro.value = i;

                        rpDataList.appendChild(ro);

                    // If row found
                    } else {
                        // Update row
                        found.children[2].textContent = a[i];

                        // Update transmitter option
                        var tmi = document.getElementById("tm_" + i);
                        var genStr = (acMap.indexOf(i) + 1) + " - " + i + " - " + a[i] + " eth";
                        if (tmi.innerHTML != genStr) {
                            diffList.push(i);
                            tmi.innerHTML = genStr;
                        }
                    }
                }
                
                // Process highlighting
                if (h && diffList.length > 0) {
                    for (var i in diffList) {
                        var tempTr = document.getElementById("ac_" + diffList[i]);
                        tempTr.classList.remove("updated");
                        tempTr.classList.add("updated");
                        setTimeout(function() {
                            tempTr.classList.remove("updated");
                        }, 1800);
                        if (i == 0)
                            tempTr.scrollIntoView();
                    }
                    diffList = [];
                }
            }
        };
        
        // Websocket binder
        var soc = io();
        soc.on("init", function (a) {
            updateList(a);
            pageOpen();
        });
        soc.on('disconnect', pageClose);
        soc.on('update', a => {
            updateList(a, true);
        });
        soc.on('txStatus', function (a) {
            updateStatus(a, false, false);
        });
        soc.on('txResult', function (a) {
            if (a.state) {
                updateStatus("Successful!");
            } else {
                updateStatus(a.reason);
            }
        });
        soc.on('gpUpdate', function (a) {
            gasPrice.textContent = a;
        });

        // Bind submit button event
        document.getElementById("submit").onclick = function () {
            updateStatus("Sending...", false, false);
            var data = {};
            data.rp = document.getElementById("rp").value;
            document.getElementById("rp").value = "";
            data.val = document.getElementById("val").value;
            document.getElementById("val").value = "";
            data.tm = document.getElementById("acc_select").selectedOptions[0].id.substring(3);
            data.pwd = document.getElementById("pwd").value;
            document.getElementById("pwd").value = "";
            document.activeElement.blur();
            soc.emit('send', data);
            return false;
        }
    }
};
