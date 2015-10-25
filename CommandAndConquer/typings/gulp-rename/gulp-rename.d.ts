
/// <reference path="../node/node.d.ts" />

interface IGulpRenameOptions {
    dirname?: string;
    basename?: string;
    extname?: string;
    prefix?: string;
    suffix?: string;
}

interface IGulpRenameFn {
    (filename: string): NodeJS.ReadWriteStream;
    (obj: IGulpRenameOptions): NodeJS.ReadWriteStream;
    (fn: (options: IGulpRenameOptions) => void): NodeJS.ReadWriteStream;
}

declare module "gulp-rename" {
    var rename: IGulpRenameFn;
    export = rename;
}