
/// <reference path="../node/node.d.ts" />

interface IGulpBrowserifyOptions {
    transform?: string[] | Function[];
    debug?: boolean;
    extensions?: string[];
    ignore?: string[];
    resolve?: Function;
    nobuiltins?: string | string[];
    shim?: Object;
}

interface IGulpBrowserify {
    (options?: IGulpBrowserifyOptions): NodeJS.ReadWriteStream;
}

declare module "gulp-browserify" {
    var browserify: IGulpBrowserify;
    export = browserify;
}