init();

function init(){
    setLoadXY();
    setAddButtonClicked();
    setSaveButtonClicked();
}

function setSaveButtonClicked(){
    
    var button = document.getElementById("saveButton");
    
    button.addEventListener("click", function(){
       var content = document.getElementById("content");
        
        // all XY pairs - length-1 exclude saveButton
        for(var i=0;i<content.children.length-1;i++){
            var X = content.children[i].getElementsByClassName("X")[0].value;
            var Y = content.children[i].getElementsByClassName("Y")[0].value;
            
            chrome.storage.sync.set({[X]: Y});
        }
        
        // close content
        document.getElementById("showButton").click();
    });
}

function setAddButtonClicked(){
    
    var button = document.getElementById("addButton");
    
    button.addEventListener("click", function(){
        var newX = document.getElementById("newX");
        var newY = document.getElementById("newY");
        
        var key = newX.value;
        var value = newY.value;
        
        chrome.storage.sync.get(key, function(item){
            
            // if it is already in the storage
            if(item[key] != undefined) return;
           
            // add new key and value to the storage
            // to achieve a dynamic naming, use "[key]"
            chrome.storage.sync.set({[key]: value}, function(){
                
                /* To obtain a ordered list, avoid adding new XY into the list by hand.
                 * Instead, reload the list every time a new XY is added.
                 */
                
                // if content is not shown 
                if(!document.getElementById("content").style.maxHeight) return; 
                
                // clean previous
                cleanContent();
                
                // add XYs and show
                loadAndShowContent();

            });
            
        });
    
        // clear text inputs
        newX.value = "";
        newY.value = "";
        
    });
    
}

function setLoadXY(){
    
    var showButton = document.getElementById("showButton");
    
    showButton.addEventListener("click", function() {
        this.classList.toggle("active");
        
        var content = this.nextElementSibling;
        
        // case: it is shown - action: hide it
        if (content.style.maxHeight) 
            content.style.maxHeight = null;
        
        // case: it is hidden - action: show it
        else {
            // clean previous XYs 
            cleanContent();
            // add XYs and show
            loadAndShowContent();
        }
        
    });
    
}

function loadAndShowContent(){
    chrome.storage.sync.get(null, function(keys) {
        
        // load storage into page
        for(key in keys){
            // create a new field for each item
            var XY = createXYDiv(key);
            // add it to the content div
            document.getElementById("content").insertBefore(XY,document.getElementById("content").lastElementChild);
        }
        
        // make it visible
        document.getElementById("content").style.maxHeight = document.getElementById("content").scrollHeight + "px";
            
    });
}

function cleanContent(){
    var content = document.getElementById("content");
    
    // remove childs until save button remaining
    while(content.children.length != 1)
        content.removeChild(content.firstChild);
}

function setRemoveButtonClicked(removeButton){

    // add click functionality to removeButton
    removeButton.addEventListener("click", function(){
        var parent = this.parentElement;
        var x = parent.getElementsByClassName("X")[0].value;
        // remove it from the storage
        chrome.storage.sync.remove(x);
        // remove it from the list
        parent.parentElement.removeChild(parent);
    });
    
}

function createXYDiv(key){
    // create a new field for each item
    var XY = document.getElementById("XYtemplate").cloneNode(true);
                
    XY.style.display = "block"; // make it visible
    XY.removeAttribute("id"); // remove its id
                    
    // set X and Y fields
    XY.getElementsByClassName("X")[0].value = key;
    chrome.storage.sync.get(key, function(result){
        // to access a key dynamically, use "[key]"
        XY.getElementsByClassName("Y")[0].value = result[key];
    });
                    
    // adjust remove button
    setRemoveButtonClicked(XY.getElementsByClassName("removeButton")[0]);
    
    return XY;
}