/**
* Author: willblaschko (https://github.com/willblaschko)
* 
* Copyright 2016 Will Blaschko
* Based on work by Austyn Mahoney (https://github.com/austynmahoney/mobile-export-scripts-illustrator)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/*
* An Illustrator Script (written in Javascript) for exporting artboards to Android and iOS PNG24 assets in the proper directory structure and scale types. 
* 
* How To
* ---
* 1. Import the script into Illustrator CC
* 
* > To include a script in the Scripts menu (File > Scripts), save the script in the Scripts folder, located in the `/lllustrator CC/Presets` folder in your lllustrator CC installation directory. The script’s filename, minus the file extension, appears in the Scripts menu. Scripts that you add to the Scripts folder while Illustrator is running do not appear in the Scripts menu until the next time you launch Illustrator.
* 
* 2. Open the Illustrator file that includes the artboards you want to export.
* 3. Select this script from the Illustrator Scripts menu.
* 4. Choose the directory where you want the images to be exported to.
* 5. A dialog with the supported scale types will open. If any Android types are selected, it's directory will be created inside `/Android/{SCALE_TYPE}` (e.g. `/Android/drawable-mdpi`, `/Android/drawable-xhdpi`). Any iOS types will be placed in `/iOS`.
* 
* The name of the exported images will match the name of the artboard. If the artboard is named `app-icon`, and you select all the available options, the script will export the artboard into the following directory structure:
* ```
* Selected Directory
* ├───Android
* │   ├───drawable-mdpi
* │   │   └───app_icon.png
* │   ├───drawable-hdpi
* │   │   └───app_icon.png
* │   ├───drawable-xhdpi
* │   │   └───app_icon.png
* │   ├───drawable-xxhdpi
* │   │   └───app_icon.png
* │   ├───drawable-xxxhdpi
* │   │   └───app_icon.png
* └───iOS
*     ├───app-icon.png
*     ├───app-icon@2x.png
*     └───app-icon@3x.png
* ```
* 
* The baseline image used for Android is `xhdpi`, for iOS it is `@2x`. The script will scale up and down from these sizes.
*/

var selectedExportOptions = {};

var androidExportOptions = [
    {
        name: "mdpi",
        scaleFactor: 50,
        type: "android"
    },
    {
        name: "hdpi",
        scaleFactor: 75,
        type: "android"
    },
    {
        name: "xhdpi",
        scaleFactor: 100,
        type: "android"
    },
    {
        name: "xxhdpi",
        scaleFactor: 150,
        type: "android"
    },
    {
        name: "xxxhdpi",
        scaleFactor: 200,
        type: "android"
    }
];

var iosExportOptions = [
    {
        name: "",
        scaleFactor: 50,
        type: "ios"
    },
    {
        name: "@2x",
        scaleFactor: 100,
        type: "ios"
    },
    {
        name: "@3x",
        scaleFactor: 150,
        type: "ios"
    }
];

var folder = Folder.selectDialog("Select export directory");
var document = app.activeDocument;

if(document && folder) {
    var dialog = new Window("dialog","Select export sizes");
    var osGroup = dialog.add("group");

    var androidCheckboxes = createSelectionPanel("Android", androidExportOptions, osGroup);
    var iosCheckboxes = createSelectionPanel("iOS", iosExportOptions, osGroup);

    var buttonGroup = dialog.add("group");
    var okButton = buttonGroup.add("button", undefined, "Export");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    okButton.onClick = function() {
        for (var key in selectedExportOptions) {
            if (selectedExportOptions.hasOwnProperty(key)) {
                var item = selectedExportOptions[key];
                exportToFile(item.scaleFactor, item.name, item.type);
            }
        }
        this.parent.parent.close();
    };
    
    cancelButton.onClick = function () {
        this.parent.parent.close();
    };

    dialog.show();
}

//Convert filename to lowercase and remove all invalid characters from
//the file export name.
//helper function for getAndroidFileName()
function replaceInvalidChars(inStr){
    inStr=inStr.toLowerCase();
    return inStr.replace(/[^\w.]/g, "_");
}

//Create a valid Android resource name
//
//filename: the name of the active artboard that we want to convert
//into Android assets
function getAndroidFileName(fileName){
    fileName = replaceInvalidChars(fileName);
    return fileName;
}

function exportToFile(scaleFactor, resIdentifier, os) {
    var i, ab, file, options, expFolder;
    if(os === "android")
        expFolder = new Folder(folder.fsName + "/drawable-" + resIdentifier);
    else if(os === "ios")
        expFolder = new Folder(folder.fsName + "/iOS");

    if (!expFolder.exists) {
        expFolder.create();
    }

    for (i = document.artboards.length - 1; i >= 0; i--) {
        document.artboards.setActiveArtboardIndex(i);
        ab = document.artboards[i];
        
        if(os === "android")
            file = new File(expFolder.fsName + "/" + getAndroidFileName(ab.name) + ".png");
        else if(os === "ios")
            file = new File(expFolder.fsName + "/" + ab.name + resIdentifier + ".png");
            
            options = new ExportOptionsPNG24();
            options.transparency = true;
            options.artBoardClipping = true;
            options.antiAliasing = true;
            options.verticalScale = scaleFactor;
            options.horizontalScale = scaleFactor;

            document.exportFile(file, ExportType.PNG24, options);
    }
};

function createSelectionPanel(name, array, parent) {
    var panel = parent.add("panel", undefined, name);
    panel.alignChildren = "left";
    for(var i = 0; i < array.length;  i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + array[i].name);
        cb.item = array[i];
        cb.onClick = function() {
            if(this.value) {
                selectedExportOptions[this.item.name] = this.item;
            } else {
                delete selectedExportOptions[this.item.name];
            }
        };
    }
};

