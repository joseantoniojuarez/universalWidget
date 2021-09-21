//----------------------------------------------------------------
// Universal Widget: Simple way to unify digital customer service
// Oracle PM CoE - Cross CX Innovations
// jose.antonio.juarez@oracle.com
// Malaga // Spain // 2021
//----------------------------------------------------------------

var universalWidget = (function() {
    'use strict';

    function init() {
        addEventListeners()
            .then(restoreStatusUI()
                .then(hideNativeWidgetsButtons())
                .catch(error => console.log(error)))
            .catch(error => console.log(error))
    }

    //#region Add eventlisteners & Oracle JS resources
    function addEventListeners() {
        return new Promise(function(resolve, reject) {
            try {
                document.getElementById('mswTopAnswers').addEventListener('click', mswTopAnswersActivate, false);
                document.getElementById('mswChatBot').addEventListener('click', mswChatbotActivate, false);
                document.getElementById('mswLiveChat').addEventListener('click', mswLiveChatActivate, false);
                document.getElementById('mswCobrowse').addEventListener('click', mswCobrowseActivate, false);
                document.getElementById('mswStartCobrowseButton').addEventListener('click', mswCobrowseStart, false);
                document.getElementById('mswEndCobrowseButton').addEventListener('click', mswCobrowseEnd, false);
                document.getElementById('mswFeedback').addEventListener('click', mswFeedbackActivate, false);
                document.getElementById('mswFeedbackButton').addEventListener('click', function() { alert('Your code here!'); }, false);
                document.getElementById('mswIconContainer').addEventListener('click', mswClick, false);
                checkExistingCobrowseSession();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    //#endregion

    //#region Widget interaction
    //MSWidget main icon onClick action & update status
    function mswClick() {
        var status;
        if (getWidgetStatus() != null) {
            status = getWidgetStatus();
        } else {
            status = '0';
        }
        //Open Widget Menu
        if (status == '0') {
            mswShowMenu();
            setWidgetStatus(1);
        }
        //Close Widget icon and menu
        else {
            //All cases except 0
            document.getElementById("mswIconContainer").classList.remove("mswContainerOpen");
            document.getElementById("mswOptions").classList.remove("mswShowOption");
            switch (status) { //Close the widget that is open
                case "2":
                    document.getElementById("topAnswers").contentDocument.getElementById("oit-wc-oit-inlay").getElementsByClassName("oit-inlay-header-type-nav1")[0].click();
                    document.getElementById("topAnswers").contentDocument.getElementById("oit-wc-oit-inlay").getElementsByClassName("oit-inlay-header-nav-back")[0].click();
                    break;
                case '3':
                    document.getElementsByClassName("oda-chat-button-close")[0].click();
                    break;
                case '4':
                    document.getElementById("chatInlay").contentDocument.getElementsByClassName("oit-inlay-header-actions-minimize")[0].click();
                    break;
                case '5':
                    document.getElementById("mswFeebackContainer").classList.add("mswHide");
                    break;
                case '6':
                    document.getElementById("mswCobrowseContainer").classList.add("mswHide");
                    break;
                default:
                    break;
            }
            //new status is reset, only Universal Widget visible
            setWidgetStatus(0);
        }
    }
    //#endregion

    //#region Open selected widget
    //Decrease universal widget icon size and show main menu
    function mswShowMenu() {
        document.getElementById("mswIconContainer").classList.add("mswContainerOpen");
        document.getElementById("mswOptions").classList.add("mswShowOption");
    }

    function mswTopAnswersActivate() {
        secureAccess('topAnswers').then(() => {
            document.getElementById("topAnswers").classList.add('mswFixPosition');
            document.getElementById("topAnswers").contentDocument.getElementById("oit-wc-oit-inlay").getElementsByClassName("oit-inlay-header-type-nav1")[0].click();
            document.getElementById("mswOptions").classList.remove("mswShowOption");
            setWidgetStatus(2);
        }).catch((error) => { console.log(error); });
    }

    function mswChatbotActivate() {
        document.getElementsByClassName('oda-chat-widget')[0].classList.add('mswFixPositionODA');
        document.getElementsByClassName("oda-chat-button")[0].click();
        document.getElementById("mswOptions").classList.remove("mswShowOption");
        setWidgetStatus(3);
    }

    function mswLiveChatActivate() {
        secureAccess('chatInlay').then(() => {
            document.getElementById("chatInlay").classList.add('mswFixPosition');
            document.getElementById("chatInlay").contentDocument.getElementsByClassName("oit-inlay-header")[0].click()
            document.getElementById("mswOptions").classList.remove("mswShowOption");
            setWidgetStatus(4);
        }).catch((error) => { console.log(error); });
    }

    function mswFeedbackActivate() {
        document.getElementById("mswFeebackContainer").classList.remove("mswHide");
        document.getElementById("mswOptions").classList.remove("mswShowOption");
        setWidgetStatus(5);
    }

    function mswCobrowseActivate() {
        document.getElementById("mswCobrowseContainer").classList.remove("mswHide");
        document.getElementById("mswOptions").classList.remove("mswShowOption");
        setWidgetStatus(6);
    }
    //#endregion

    //#region Status persistence
    //Status persistence when brosing, set same UI mode after page loads
    function restoreStatusUI() {
        return new Promise(function(resolve, reject) {
            try {
                if (getWidgetStatus() != null) {
                    switch (getWidgetStatus()) {
                        case "0":
                            //Nothing to do, initial widget state
                            break;
                        case "1":
                            mswShowMenu();
                            break;
                        case "2":
                            document.getElementById("mswIconContainer").classList.add("mswContainerOpen");
                            mswTopAnswersActivate();
                            break;
                        case "3":
                            document.getElementById("mswIconContainer").classList.add("mswContainerOpen");
                            mswChatbotActivate();
                            break;
                        case "4":
                            document.getElementById("mswIconContainer").classList.add("mswContainerOpen");
                            mswLiveChatActivate()
                            break;
                        case "5":
                            document.getElementById("mswIconContainer").classList.add("mswContainerOpen");
                            document.getElementById("mswFeebackContainer").classList.remove("mswHide");
                            document.getElementById("mswOptions").classList.remove("mswShowOption");
                            break;
                        case "6":
                            document.getElementById("mswIconContainer").classList.add("mswContainerOpen");
                            document.getElementById("mswCobrowseContainer").classList.remove("mswHide");
                            document.getElementById("mswOptions").classList.remove("mswShowOption");
                            break;
                        default:
                            break;
                    }
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    //#endregion

    //#region Cobrowse
    //This is just an example of cobrowsing usage replacing native UI
    //Cobrowse Start a new session
    function mswCobrowseStart() {
        try {
            document.getElementById('mswStartCobrowseButton').disabled = true;
            document.getElementById('mswCobrowseId').innerHTML = "";
            Cobrowse.API.Session.start();
            let cont = 0
            var checkCobSession = setInterval(function() {
                if (cont++ > 50) {
                    clearInterval(checkCobSession);
                    alert("It is no possible to start a new Cobrowse session.")

                } else {
                    let CobSessionId = Cobrowse.API.Session.accessCode;
                    if (CobSessionId != undefined) {
                        clearInterval(checkCobSession);
                        document.getElementById('mswCobrowseId').innerHTML = CobSessionId;
                        document.getElementById('mswStartCobrowseButton').classList.add('mswHide');
                        document.getElementById('mswCobrowseActive').classList.remove('mswHide');
                    }
                }
            }, 100);
        } catch (error) {
            alert("Error creating a Crobrowsing session, API not available: \n" + error);
            document.getElementById('mswStartCobrowseButton').disabled = false;
        }
        document.getElementById('mswStartCobrowseButton').disabled = false;
    }

    //Close current session
    function mswCobrowseEnd() {
        try {
            Cobrowse.API.Session.stop();
            document.getElementById('mswCobrowseActive').classList.add('mswHide');
            document.getElementById('mswCobrowseId').innerHTML = "";
            setTimeout(function() {
                document.getElementById('mswStartCobrowseButton').classList.remove('mswHide');
            }, 500)


        } catch (error) {
            alert("Error closing this Crobrowsing session, API not available: \n" + error);
        }
    }

    //Detect existing cobrowse session (After page navigation)
    function checkExistingCobrowseSession() {
        try {
            setTimeout(function() {
                var CobSessionId = Cobrowse.API.Session.accessCode;
                if (CobSessionId != undefined) {
                    document.getElementById('mswCobrowseId').innerHTML = CobSessionId;
                    document.getElementById('mswStartCobrowseButton').classList.add('mswHide');
                    document.getElementById('mswCobrowseActive').classList.remove('mswHide');
                }
            }, 1000)
        } catch (error) {
            console.log("Error checking existing Crobrowsing session.")
        }
    }
    //#endregion

    //#region Hide Oracle Native lauch buttons
    //Hide Oracle Widgets native buttons inside Iframes & Fix widgets position
    //This MUST be done via CSS in inlay settings files, this is just an example that modifies the style of ANY inlay button for demo purposes
    //In production these CSS changes must be done via OIT configuration

    function hideNativeWidgetsButtons() {
        hideTopAnswersButton();
        hideLiveChatButton();
    }

    function hideTopAnswersButton(counter = 0) {
        secureAccess('topAnswers').then(() => {
            var style = document.createElement('style');
            var css = '.oit-inlay-header-type-nav1 {pointer-events: none;} .fa-compress {display:none !important;} .oit-frame[data-oit-mode=overlay-br-min] {display: none !important} .oit-inlay-header-nav-back {display: none !important;}';
            document.getElementById("topAnswers").contentDocument.body.appendChild(style);
            style.appendChild(document.createTextNode(css));
            console.log('TopAnswer Button hidden');
        }).catch((error) => { console.log(error); });
    }

    function hideLiveChatButton(counter = 0) {
        secureAccess('chatInlay').then(() => {
            var style = document.createElement('style');
            var css = '.screen-minimized {display:none !important;} .oit-inlay-header-actions-minimize {display:none !important;} .fa-compress {display:none !important;}';
            document.getElementById("chatInlay").contentDocument.body.appendChild(style);
            style.appendChild(document.createTextNode(css));
            console.log('Inlay LiveChat Button hidden');
        }).catch((error) => { console.log(error); });
    }
    //#endregion

    //#region Axuliar functions
    //Check if a tag element has been populated as an Inlay Iframe object (wait if not)
    //In production this is not necesary, changes are done via OIT config files, so there is no need to detect if the inlay is rendered to apply any change
    function secureAccess(element) {
        return new Promise((resolve, reject) => {
            const interval = 20;
            const maxLoops = 100;
            var counter = 0;
            let timerId = setInterval(() => {
                if (counter++ > maxLoops) {
                    clearInterval(timerId);
                    reject('Secure Access timed out => ' + element + ' | Attemps: ' + counter);
                } else {
                    try {
                        var target = document.getElementById(element);
                        if (target.tagName == "IFRAME" && target.dataset.oitStatus == "loaded") {
                            clearInterval(timerId);
                            resolve('Secure Access confirmed: ' + element);
                        }
                    } catch (error) {
                        //Element undefined, not ready
                    }
                }
            }, interval);;
        });
    }

    //Store status to preserve UI while browsing, user your favorite storage method
    function setWidgetStatus(status) {
        localStorage.setItem('uwSessionStatus', status);
    }

    function getWidgetStatus() {
        return localStorage.getItem('uwSessionStatus');
    }
    //#endregion

    return {
        init: init
    };
})();

//Launch Universal Widget
window.addEventListener('load', function() {
    universalWidget.init();
});