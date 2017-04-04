var packager = require('electron-packager');
packager({
    dir: "D:\\git\\mongoclient_packaged",
    name: "Mongoclient",
    buildVersion: "2.0.0",
    appVersion: "2.0.0",
    icon: "D:\\git\\mongoclient_packaged\\app\\programs\\web.browser\\app\\logo\\head.ico",
    overwrite: true,
    out: "D:\\git\\mongoclient_packaged\\packaged",
    electronVersion: "1.6.2",
    asar: {
        unpackDir: "bin"
    }

}, (err, appPaths) => {
});