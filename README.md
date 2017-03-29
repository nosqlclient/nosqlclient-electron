## Mongoclient, Electron Packaging Scaffold
Scaffold for electron packaging of [Mongoclient](https://github.com/mongoclient/mongoclient), can be used with the [MeteorJS](https://github.com/meteor/meteor) applications

### Steps
1. Bundle mongoclient with command: `meteor build --server --directory <output>` and put contents into `app` folder
2. Copy contents of `C:\Users\Sercan\AppData\Local\.meteor\packages\meteor-tool\1.4.3_2\mt-os.windows.x86_32\dev_bundle\server-lib\node_modules` to `app\programs\server\node_modules`
3. Copy `Node (4.2.7)` to `bin` folder
4. Copy `Mongod (>= 3.2.6)` to `bin` folder


### Steps to RUN directly
- Run: `npm install -g electron`
- Run: `electron .`

### Steps to PACKAGE
- Run: `npm install -g electron-packager`
- Run: `electron-packager . Mongoclient --app-version=2.0.0 --build-version=2.0.0 --icon=D:\git\mongoclient_packaged\app\programs\web.browser\app\logo\head.ico --overwrite --out=D:\git\mongoclient_packaged\packaged --electronVersion=1.6.2`

### License
Licensed under AGPL v3.0

### Credits (Loading Splash Screen)
- [please-wait](https://github.com/Pathgather/please-wait)
- [Spinkit](https://github.com/tobiasahlin/SpinKit)