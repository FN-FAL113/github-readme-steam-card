import { readFile } from 'fs/promises';
import axios from 'axios';

export async function getEncodedWebMedia(url: string, encoding: string): Promise<string|ArrayBuffer|undefined>
{
    try {
        const image = await axios.get(url, {
            responseType: encoding === 'base64' ? 'text' : 'arraybuffer',
            responseEncoding: encoding === 'base64' ? 'base64' : 'binary'
        })
    
        return image.data
    } catch (error) {
        console.error(error)
    }
}

export async function getEncodedLocalMedia(path: string): Promise<string|undefined> 
{
    try {
        return await readFile(path, { encoding: 'base64' })
    } catch (error) {
        console.error(error)
    }
}