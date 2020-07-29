//AJAX function to get the additional json files.

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

//Close a modal by modal name
function closeMdl(nomeMdl) {
    location.hash = "/";
    document.getElementById(nomeMdl).style.display = 'none'
    return 0;
}

//Open a modal by modal name
function openMdl(nomeMdl) {
    document.getElementById(nomeMdl).style.display = 'block'
    return 0;
}

//Open a modal by hash location
function openMdlOnPageLoad() {
    var location_hash = location.hash;
    var mdlName = "mdl_" + location_hash.substring(2, location_hash.length);
    if (mdlName !== "mdl_") {
        openMdl(mdlName);
    }
}

//Load preferences from local storage and initialize them if necessary
function loadPrefs() {
    if (typeof (Storage) !== "undefined") { //check if localstorage is supported
        var search_engine = localStorage.getItem("search_engine");
        if (search_engine == null) { //initialize value
            localStorage.setItem("search_engine", "google");
        }
        var custom_backdrop = localStorage.getItem("custom_backdrop");
        if (custom_backdrop != null) { //apply custom backdrop
            document.getElementById("pref.custom_backdrop").innerHTML = custom_backdrop;
        }
        
    } else {
        alert("Error! No WebStorage Support!")
    }
}

//Save preferences to local storage
function savePrefs() {
    //searchengine
    Object.entries(config_obj.search_engines).forEach(([key, value]) => {
        if (value.index == document.getElementById("pref.search_engine").selectedIndex) {
           console.log(key);
           localStorage.setItem("search_engine", key);
        };
    });
    localStorage.setItem("custom_backdrop", document.getElementById("pref.custom_backdrop").value);
    closeMdl("mdl_preferences");
    getConfig();
    getBackdrop();
    //localStorage.setItem("search_engine", );
}


function resetPrefs() {
    localStorage.removeItem("search_engine");
    localStorage.removeItem("custom_backdrop");
    document.getElementById("pref.custom_backdrop").value = null;
    closeMdl("mdl_preferences");
    getBackdrop();
    
}

function getConfig() {
    var req_obj = new XMLHttpRequest();
    req_obj.onload = reqListener;
    req_obj.open("get", "/assets/config.json", true);
    req_obj.send();

    function reqListener(e) {
        config_obj = JSON.parse(this.responseText);
        var option_str = null;
        Object.entries(config_obj.search_engines).forEach(([key, value]) => {
            option_str = option_str + `<option value="${key}">${value.friendlyName}</option>`;
        });
        document.getElementById("pref.search_engine").innerHTML = option_str;
        document.getElementById("pref.search_engine").selectedIndex = config_obj.search_engines[localStorage.getItem("search_engine")].index;
        var pref_search_engine = localStorage.getItem("search_engine");
        console.log(pref_search_engine);
        console.log(config_obj.search_engines[pref_search_engine].index)
        document.getElementById("search-form").action = config_obj.search_engines[pref_search_engine].endpointURL;
    }

}

//Get the backdrop with matching metadata from backdrops.json, based on the current day.
function getBackdrop() {
    if (localStorage.getItem("custom_backdrop") == null || localStorage.getItem("custom_backdrop") == "") {
        var backdrops;
        var req_obj = new XMLHttpRequest();
        req_obj.onload = reqListener;
        req_obj.open("get", "/assets/backdrops.json", true);
        req_obj.send();

        function reqListener(e) {
            backdrops = JSON.parse(this.responseText);
            var today = new Date();
            var c = today.getDate() - 1;
            var a = "body { background-image: url('/assets/media/backdrops/" + backdrops[c].filename + "'); background-repeat: no-repeat; background-size: cover!important; }";
            var b = 'Backdrop photo by <a href="' + backdrops[c].attrURL + '">' + backdrops[c].authorName + "</a> on Unsplash.";
            document.getElementById("js-backdrop").innerHTML = a;
            //document.getElementById("js-unsplash-attrib").innerHTML = b

        }
    } else {
        var a = "body { background-image: url('" + localStorage.getItem("custom_backdrop") + "'); background-repeat: no-repeat; background-size: cover!important; }";
        document.getElementById("js-backdrop").innerHTML = a;
    }
    
}

function checkForShortCuts(){

    document.addEventListener('keyup', (e) => {
        if (e.shiftKey && e.keyCode == 71) {
            document.getElementById('pref.search_engine').selectedIndex = 0;
            savePrefs();
        } else if (e.shiftKey && e.keyCode == 89) {
            document.getElementById('pref.search_engine').selectedIndex = 2;
            savePrefs();
        } else if (e.shiftKey && e.keyCode == 66) {
            document.getElementById('pref.search_engine').selectedIndex = 1;
            savePrefs();
        } else if (e.shiftKey && e.keyCode == 68) {
            document.getElementById('pref.search_engine').selectedIndex = 3;
            savePrefs();
        } else if (e.shiftKey && e.keyCode == 81) {
            document.getElementById('pref.search_engine').selectedIndex = 4;
            savePrefs();
        } else if (e.shiftKey && e.keyCode == 69) {
            document.getElementById('pref.search_engine').selectedIndex = 6;
            savePrefs();
        }
    }, false);
}

function on_page_load() {
    checkForShortCuts();
    loadPrefs();
    getConfig();
    getBackdrop();
    openMdlOnPageLoad();
}