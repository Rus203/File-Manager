import path from 'path'
import { chdir } from 'process'


export const getCorrectPath = function(pwd, testPath)  {
    chdir(`C:${path.sep}`)
    if(path.isAbsolute(testPath))
        return testPath
    else 
        return path.join(pwd, testPath)
}

export const parseUserName = function() {
    let args = process.argv
    for(let i = 0; i < args.length; i++) {
        if(args[i].includes('--username=')) {
            let index = args[i].indexOf('--username')
            return args[i].slice(index + 10 + 1)
        }
    }
    return
}
