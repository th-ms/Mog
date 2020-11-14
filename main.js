const { app, BrowserWindow } = require('electron')
const ipc = require('electron').ipcMain;
const fs = require('fs');
const path = require('path');
const { electron } = require('process');

const dataPath = app.getPath('userData');

function writeData(key, value, file) {
    var filePath = path.join(dataPath, file);
    let contents = parseData(filePath);
    contents[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(contents));
}

function readData(key, file) {
    var filePath = path.join(dataPath, file);
    let contents = parseData(filePath);
    return contents[key];
}

function parseData(filePath) {
    const defaultData = {};
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return defaultData;
    }
}

ipc.on('fetchData', function(event, data){
    var result = readData('queue', 'queue.json')
    event.sender.send('response', result)
})

ipc.on('nextSong', (event, data) => {
    var queue = readData('queue', 'queue.json');
    if (queue.length == 0) {
        event.sender.send('nSR', {'error':0})
    }
    else {
        var nextSong = queue[0];
        queue.shift();
        writeData('queue', queue, 'queue.json')
        event.sender.send('nSR', nextSong)
    }
})

ipc.on('addToQueue', (event, data) => {
    var queue = readData('queue', 'queue.json');
    if (data.front){
        queue.unshift({
            'id':data.id,
            'title':data.title,
            'artist':data.artist,
            'thumbnail':data.thumbnail,
            'duration':data.duration,
            'sid':data.sid
        })
    } else {
        queue.push({
            'id':data.id,
            'title':data.title,
            'artist':data.artist,
            'thumbnail':data.thumbnail,
            'duration':data.duration,
            'sid':data.sid
        })
    }
    writeData('queue', queue, 'queue.json')
    event.sender.send('response', 'DONE')
})

ipc.on('loadQueue', (event, data) => {
    var queue = readData('queue', 'queue.json');
    event.sender.send('queueResponse', queue)
})

ipc.on('reloadQueue', (event, data) => {
    var queue = readData('queue', 'queue.json');
    event.sender.send('rLQR', queue)
})

ipc.on('removeFromQueue', (event, data) => {
    var queue = readData('queue', 'queue.json');
    var found = queue.filter(e=>e.sid==data.sid)[0]
    if (found){
        queue.splice(queue.indexOf(found), 1)
    }
    writeData('queue', queue, 'queue.json')
    event.sender.send('qRR', data.sid)
})

ipc.on('loadedQueue', (event, data) => {
    var queue = readData('queue', 'queue.json');
    queue.shift()
    writeData('queue', queue, 'queue.json')
})

const server = require('./app');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false
    })
    mainWindow.loadURL('http://localhost:3000/')
    mainWindow.on('closed', () => {
        mainWindow = null;
    })
    //mainWindow.webContents.openDevTools();
}

app.on('ready', () => {
    createWindow()
})

app.on('resize', function(e,x,y){
    mainWindow.setSize(x, y);
  });
  
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})