import process from 'process'
import os from 'os'
import { parseUserName } from './utils.js'
import { FileManager } from './fileManager.js'

// the command to launch
// npm run start -- --username=your_username


const fm = new FileManager()

let userName = parseUserName()
let reader = process.stdin
const operationError = 'Operation failed'

if (userName) {
    console.log(`Welcome to the File Manager, ${userName}!`)
    console.log(`You are currently in ${os.homedir()}`)
    
} else {
    console.log('error, try to launch the app with a name')
    process.exit()
}

process.on('SIGINT', () => {
    console.log(`Thank you for using File Manager, ${userName}`)
    process.exit()
});


reader.on('data', content => {
    content = content.toString().trim()

    if (content.trim() == '.exit') {
        console.log(`\nThank you for using File Manager, ${userName}`)
        process.exit()
    }

    let operation = content.split(' ')
    switch(operation[0]) {
        case 'up':
            fm.up()
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'cd': 
            fm.cd(operation[1])
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'ls': 
        fm.ls()
            .then(list => console.log(list), () => console.log(operationError))
            .then(() => console.log(fm.pwd()))
            break
        case 'cat': 
            fm.cat(operation[1]).catch(() => console.log(operationError))
            .then(() => console.log(fm.pwd()))
            break
        case 'add':
            fm.add(operation[1])
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'rn':
            fm.rn(operation[1], operation[2])
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'cp':
            fm.cp(operation[1], operation[2])
                .catch(e => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'mv': 
            fm.move(operation[1], operation[2])
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'rm':
            fm.delete(operation[1])
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'os': 
            fm.osInfo(operation[1])
                .then(data => console.log(data))
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'hash': 
            fm.hash(operation[1]).then(hash => console.log(hash))
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'compress': 
            fm.compress(operation[1], operation[2])
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'decompress':  
            fm.decompress(operation[1], operation[2])
                .catch(() => console.log(operationError))
                .then(() => console.log(fm.pwd()))
            break
        case 'pwd':
            console.log(fm.pwd())
            break
        default: console.log('Invalid input')
    }
})




