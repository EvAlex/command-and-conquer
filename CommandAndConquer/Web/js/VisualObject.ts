
class VisualObject {

    protected loaded: boolean;
    protected preloadCount: number;
    protected loadedCount: number;

    preloadImage(imgUrl: string, callbackFunction?: () => void): HTMLImageElement {
        this.loaded = false;
        var image = new Image();
        image.src = 'images/' + imgUrl;
        this.preloadCount++;
        $(image).bind('load', () => {
            this.loadedCount++;
            if (this.loadedCount == this.preloadCount) {
                this.loaded = true;
            }
            if (callbackFunction) {
                callbackFunction();
            }
        });
        return image;
    }

    loadImageArray(imgName, count, extn) {
        if (!extn) {
            extn = '.png';
        }
        var imageArray = [];
        for (var i = 0; i < count; i++) {
            imageArray.push(this.preloadImage(imgName + '-' + (i < 10 ? '0' : '') + i + extn));
        };
        return imageArray;
    }

    loadSpriteSheet(forObject: IGameObject, details, from) {
        forObject.spriteCanvas = document.createElement('canvas');
        forObject.spriteImage = this.preloadImage
            (from + '/' + details.name + '-sprite-sheet.png',
            function () {
                this.transformSpriteSheet(forObject, details);
            });
        forObject.spriteArray = [];
        forObject.spriteCount = 0;
        for (var i = 0; i < details.imagesToLoad.length; i++) {
            var constructImageCount = details.imagesToLoad[i].count;
            var constructImageName = details.imagesToLoad[i].name;
            forObject.spriteArray[constructImageName] =
            { name: constructImageName, count: constructImageCount, offset: forObject.spriteCount };
            forObject.spriteCount += constructImageCount;
        }
    }

    transformSpriteSheet(forObject, details) {
        forObject.spriteCanvas.width = forObject.spriteImage.width;
        forObject.spriteCanvas.height = forObject.spriteImage.height * 2;
        //document.body.appendChild(forObject.spriteCanvas);
        var spriteContext = forObject.spriteCanvas.getContext('2d');
        spriteContext.drawImage(forObject.spriteImage, 0, 0);
        spriteContext.drawImage(forObject.spriteImage, 0, forObject.spriteImage.height);

        var colorMap = [
            // gun turret

            { gdi: [198, 170, 93], nod: [218, 0, 0] },
            { gdi: [178, 149, 80], nod: [191, 26, 7] },
            { gdi: [97, 76, 36], nod: [108, 0, 0] },

            //power plant
            { gdi: [145, 137, 76], nod: [169, 27, 26] },
            { gdi: [125, 117, 64], nod: [133, 39, 30] },
            { gdi: [109, 101, 56], nod: [125, 1, 0] },
            { gdi: [89, 85, 44], nod: [96, 41, 24] },
            { gdi: [170, 153, 85], nod: [190, 26, 7] },
            { gdi: [194, 174, 97], nod: [220, 0, 0] },
            { gdi: [246, 214, 121], nod: [255, 0, 1] },
            { gdi: [222, 190, 105], nod: [246, 1, 0] },


        ];

        var imgData = spriteContext.getImageData(0, 0, forObject.spriteCanvas.width, forObject.spriteCanvas.height);
        var imgDataArray = imgData.data;
        var size = imgDataArray.length / 4;

    	   for (var p = size / 2; p < size; p++) {
    	     
            //console.log(p)
    	       var r = imgDataArray[p * 4];
    	       var g = imgDataArray[p * 4 + 1];
    	       var b = imgDataArray[p * 4 + 2];
    	       var a = imgDataArray[p * 4 + 2];

            if (details.type == 'turret' || details.type == 'building' || details.name == 'mcv' || details.name == 'harvester') {
                // long color map convert each yellow to re
                for (var i = colorMap.length - 1; i >= 0; i--) {
                    //alert(1)
                    if (r == colorMap[i].gdi[0] && g == colorMap[i].gdi[1] && b == colorMap[i].gdi[2]) {
                        imgDataArray[p * 4 + 0] = colorMap[i].nod[0];
                        imgDataArray[p * 4 + 1] = colorMap[i].nod[1];
                        imgDataArray[p * 4 + 2] = colorMap[i].nod[2];
                        break;
                    }
                };
            } else if (details.type == 'vehicle' || details.type == 'infantry') {
                // quick hack. Just make it grayscale
                imgDataArray[p * 4 + 0] = (r + g + b) / 3;
                imgDataArray[p * 4 + 1] = (r + g + b) / 3;
                imgDataArray[p * 4 + 2] = (r + g + b) / 3;
            }

    	   };

        for (var p = 0; p < size; p++) {
            var r = imgDataArray[p * 4];
            var g = imgDataArray[p * 4 + 1];
            var b = imgDataArray[p * 4 + 2];
            var a = imgDataArray[p * 4 + 2];

            // convert to transparent shadow
            if (g == 255 && (b == 96 || b == 89 || b == 85) && (r == 0 || r == 85)) {
                imgDataArray[p * 4] = 0;
                imgDataArray[p * 4 + 1] = 0;
                imgDataArray[p * 4 + 2] = 0;
                imgData.data[p * 4 + 3] = 0.8;
            }
        };

        spriteContext.putImageData(imgData, 0, 0);

    }

}

export = VisualObject;