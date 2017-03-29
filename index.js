const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const net = require('net');
const join = path.join;
const spawn = require('child_process').spawn;
const shell = require('shelljs');
const http = require('http');

const logTag = '[MONGOCLIENT]';

const createWindow = function () {
    console.log(logTag, 'trying to start Mongoclient electron application');
    const appRoot = path.resolve(__dirname);
    const loadingPage = join('file://', appRoot, 'loading.html');

    console.log(logTag, 'trying to show loading page while everything is getting ready, loading page url: ' + loadingPage);
    // show loading
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        frame: false
    });
    win.loadURL(loadingPage);

    //fix tunnel-ssh
    shell.cp('-R', join(appRoot, 'app', '/programs/server/npm/node_modules/tunnel-ssh'), join(appRoot, 'app', 'programs/server/npm/node_modules/meteor/modules-runtime/node_modules/'));

    beginStartingMongo(appRoot, win);
};

const beginStartingMongo = function (appRoot, loadingWin) {
    console.log(logTag, 'trying to start mongod process');
    let path = join(appRoot, 'bin', 'mongod');
    if (process.platform === 'win32') {
        path += '.exe';
    }
    console.log(logTag, 'detected mongod executable path: ' + path);

    let dataDir;
    let lockfile;

    if (process.platform === 'win32') {
        dataDir = process.env.APPDATA;
    }
    else if (process.platform === 'darwin') {
        dataDir = join(process.env.HOME, 'Library', 'Preferences');
    }
    else if (process.platform === 'linux') {
        dataDir = join(process.env.HOME, 'var', 'local');
    }
    dataDir = join(dataDir, 'Mongoclient', 'db');
    lockfile = join(dataDir, 'mongod.lock');
    console.log(logTag, 'detected mongod data directory: ' + dataDir);

    console.log(logTag, 'trying to create data dir and removing mongod.lock just in case');
    shell.mkdir('-p', dataDir);
    shell.rm('-f', lockfile);

    freeport(null, function (port) {
        console.log(logTag, 'trying to spawn mongod process with port: ' + port);
        let mongoProcess = spawn(path, [
            '--dbpath', dataDir,
            '--port', port,
            '--bind_ip', '127.0.0.1',
            '--smallfiles'
        ]);

        mongoProcess.stdout.on('data', function (data) {
            console.log(logTag, '[MONGOD-STDOUT]', data.toString());

            if (/waiting for connections/.test(data.toString())) {
                startNode(appRoot, port, loadingWin);
            }
        });

        mongoProcess.stderr.on('data', function (data) {
            console.error(logTag, '[MONGOD-STDERR]', data.toString());
        });

        mongoProcess.on('exit', function (code) {
            console.log(logTag, '[MONGOD-EXIT]', code.toString());
        });
    });
};

const startNode = function (appRoot, mongoPort, loadingWin) {
    console.log(logTag, 'trying to start node process');
    let path = join(appRoot, 'bin', 'node');
    if (process.platform === 'win32') {
        path += '.exe';
    }
    console.log(logTag, 'detected node executable path: ' + path);

    const mainPath = join(appRoot, 'app', 'main.js');
    console.log(logTag, 'detected main app root: ' + mainPath);

    freeport(null, function (port) {
        process.env.PORT = port;
        process.env.ROOT_URL = 'http://localhost:' + port;
        process.env.MONGO_URL = 'mongodb://localhost:' + mongoPort + '/mongoclient';

        console.log(logTag, 'detected environment variables: ' + JSON.stringify(process.env));

        console.log(logTag, 'trying to spawn node process with port: ' + port);
        let nodeProcess = spawn(path, [mainPath]);
        nodeProcess.stdout.on('data', function (data) {
            console.log(logTag, '[NODE-STDOUT]', data.toString());
        });

        nodeProcess.stderr.on('data', function (data) {
            console.error(logTag, '[NODE-STDERR]', data.toString());
        });

        nodeProcess.on('exit', function (code) {
            console.log(logTag, '[NODE-EXIT]', code.toString());
        });

        waitUntilMeteorGetsReady(port, loadingWin);
    });
};

const waitUntilMeteorGetsReady = function (port, loadingWin) {
    let fired = false;

    http.get(process.env.ROOT_URL, function () {
        if (!fired) {
            fired = true;
            loadWindow(port, loadingWin);
        }
    }).on('error', function (/* err */) {
        if (fired) return;
        setTimeout(function () {
            waitUntilMeteorGetsReady(port, loadingWin);
        }, 30);
    });
};

const freeport = function (start, done) {
    console.log(logTag, 'trying to find free port for spawn');
    start = start || 11235;
    const socket = new net.Socket()
        .once('connect', function () {
            socket.destroy();
            freeport(++start, done);
        })
        .once('error', function (/* err */) {
            socket.destroy();
            done(start);
        })
        .connect(start, '127.0.0.1');
};

const loadWindow = function (appPort, loadingWin) {
    const window = new BrowserWindow({
        devTools: true,
        webPreferences: {
            nodeIntegration: false
        },
        width: 1200,
        height: 900
    });

    window.loadURL("http://localhost:" + appPort);
    loadingWin.close();
};

app.on('ready', createWindow);