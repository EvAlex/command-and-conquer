
class VisualObject {

    preloadImage(imgUrl: string, callbackFunction?: () => void): HTMLImageElement {
        var loadee = this;
        this.loaded = false;
        var image = new Image();
        image.src = 'images/' + imgUrl;
        this.preloadCount++;
        $(image).bind('load', function () {
            loadee.loadedCount++;
            if (loadee.loadedCount == loadee.preloadCount) {
                loadee.loaded = true;
            }
            if (callbackFunction) {
                callbackFunction();
            }
        });
        return image;
    }

}

export = VisualObject;