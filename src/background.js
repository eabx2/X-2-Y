// Starting Notification
console.log("X-2-Y \nReady to go");

// global storage which is updated when a change occurs. So callback function has the latest storage
var storageSnapshot = {};

// initially take a snapshot of storage
chrome.storage.sync.get(null, function(items){
   storageSnapshot = items;
});

// anytime a change occurs update storageSnapshot
chrome.storage.onChanged.addListener(function(changes,areaName){
    
    for(key in changes){
        if(changes[key].newValue == undefined) delete storageSnapshot[key];
        else storageSnapshot[key] = changes[key].newValue;
    }
            
});

// refers to https://stackoverflow.com/a/5717133
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

// callback functionality
var callback = function(details) {
    
    // keep matched keys
    var matchedKeys = [];
    
    // look for protocol field
    for(key in storageSnapshot){
        if(details.url.includes(key)) matchedKeys.push(key);
    }
    
     // find the longest match
    function findMaxLength(prev,current){
        if(prev.length > current.length) return prev;
        else return current;
    }
        
    // find longest matched for both protocol and hostname field
    var longestKey = matchedKeys.reduce(findMaxLength,"");
        
    // replace
    var newUrl = details.url.replace(longestKey,storageSnapshot[longestKey]);
    
    // return nothing if newUrl is not valid at all
    if(!validURL(newUrl)) return;
        
    return {
        redirectUrl: newUrl
    };
    
};

// Filtering options
var filter = {
    urls: ["<all_urls>"]
};

// Extra information about the operation
var info = ['blocking'];

// Adding listener
chrome.webRequest.onBeforeRequest.addListener(callback, filter, info);