// cat, cp, move, hash, compress, decompress. переписать под стримы

import process from 'process'
import os from 'os'
import fs from 'fs/promises'
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream'
import crypto from 'crypto'
import zlib from 'zlib'
import path from 'path'

import { promisify } from 'util'
const pipe = promisify(pipeline);

import { getCorrectPath } from './utils.js';

export class FileManager {
    #pwd
    constructor() {
        this.#pwd = os.homedir()
        process.chdir(`${path.parse(process.env.pwd).root}`)
    }

    up() {
        return new Promise((res) => {
            const array = this.#pwd.split(path.sep)
        if (array.length >=  3 )
            this.#pwd = array.slice(0, array.length - 1 ).join(path.sep)
        else if (array.length === 2)
            this.#pwd = array.slice(0, array.length - 1 ) + path.sep
        res()
        })
    }

    async cd(dirPath = '') {
        dirPath = getCorrectPath(this.#pwd, dirPath)
        try {
            await fs.access(dirPath);
        } catch {
            throw new Error();
        }

        dirPath = getCorrectPath(this.#pwd, dirPath);
        this.#pwd = dirPath;
    }

    ls() {
        return new Promise(res => res(fs.readdir(this.#pwd )))          
    }

    async cat(filePath) {                    
        filePath = getCorrectPath(this.#pwd, filePath)
        await fs.access(filePath)
        return new Promise((res, rej) => { 
            filePath = getCorrectPath(this.#pwd, filePath)
            const readable = createReadStream(filePath, 'utf-8')

            readable.on('data', (text) => {
                console.log(text.toString())
            })

            readable.on('end', () => {
                res()
            })
        })

    } 

    add(fileName) {
        return new Promise( res => {
            fileName = getCorrectPath(this.#pwd, fileName)
            fs.writeFile(fileName, '', { flag: 'wx'})
            res()
        })
    }

    async rn(oldName, newName) { 
        let promise = new Promise((res) =>  {
            oldName = path.join(this.#pwd, oldName)
            newName = path.join(this.#pwd, newName)
            res({oldName, newName})
        })

        const names = await promise;
        return await fs.rename(names.oldName, names.newName);
    }

    cp(src, dirPath = '') { 
      
       return new Promise(res => {   
            src = getCorrectPath(this.#pwd, src)
            let fileName = path.basename(src)
             dirPath = getCorrectPath(this.#pwd, path.join(dirPath, fileName))
            const readable = createReadStream(src, 'utf-8')
            const writable = createWriteStream(dirPath, 'utf-8')
            readable.pipe(writable)
            res()
        })
    }

    async move(filePath, newPath = '') {
        let promise = new Promise(res => {
            filePath = getCorrectPath(this.#pwd, filePath)
            let fileName = path.basename(filePath)
            newPath = getCorrectPath(this.#pwd, path.join(newPath, fileName))
            res({filePath, newPath})
        }) 
        let paths = await promise
        return await fs.rename(paths.filePath, paths.newPath) 
    }

    async delete(filePath) {
        let promise =  new Promise(res => {
            filePath = getCorrectPath(this.#pwd, filePath)
            res(filePath)
        })
        await promise;
        return await fs.rm(filePath);
    }

    async hash(filePath) {                       // be careful, because the program ruins when 
    filePath = getCorrectPath(this.#pwd, filePath)
    await fs.access(filePath)
        return new Promise((res, rej) => {       // a user enters an incorrect name of a file
            filePath = getCorrectPath(this.#pwd, filePath)
            const hash = crypto.createHash('sha256')
            const input = createReadStream(filePath)
            input.on('readable', () => {
            const data = input.read()
            if (data)
                res(hash.update(data).digest('hex'))
            })
        }) 
    }

    async compress(filePath, dirName = '') {     
    filePath = getCorrectPath(this.#pwd, filePath)
    let fileName = path.basename(filePath)
    dirName = getCorrectPath(this.#pwd, path.join(dirName, fileName + '.gz'))

        async function do_gzip(input, output) {
            const gzip = zlib.createBrotliCompress();
            await fs.access(input)
            const source = createReadStream(input);
            
            const destination = createWriteStream(output);
            await pipe(source, gzip, destination);
        }
        return do_gzip(filePath, dirName);
    }

    async decompress(filePath, dirName = '') { 
        filePath = getCorrectPath(this.#pwd, filePath)
        let fileName = path.basename(filePath)
        dirName = getCorrectPath(this.#pwd, path.join(dirName, fileName.replace('.gz', '')))

        async function do_gzip(input, output) {
            const gzip = zlib.createBrotliDecompress();
            await fs.access(input)
            const source = createReadStream(input);
            
            const destination = createWriteStream(output);
            await pipe(source, gzip, destination);
        }

        return do_gzip(filePath, dirName);
    }

    pwd() {
        return `You are current in ${this.#pwd}`
    }

    osInfo (mode) {
        return new Promise((res, rej) => {
            mode = mode.slice(2)
            switch(mode) {
            case 'eol': res(JSON.stringify(os.EOL))
            case 'cpus':res(os.cpus())
            case 'homedir': res(os.homedir())
            case 'userName': res(os.userInfo().username)
            case 'architecture': res(os.arch())
            default: rej()
            }   
        })
    }
}

