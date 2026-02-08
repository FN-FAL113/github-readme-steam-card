import { readFile } from 'fs/promises';
import { join } from 'path';
import axios from 'axios';
import { getGameBackgroundApiUrlV2, getPublicImageApiUrl } from './api-url-helper';
import { mapSvgGameBgMetadata } from './svg-helper';
import { SvgGameBackgroundMetadata, SvgData } from '../types/misc';
import { GAME_BG_DIMENSIONS, FALLBACK_BG_DIMENSIONS } from '../types/contants';

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

export async function fetchGameBackground(
    gameId: string | number
): Promise<string | ArrayBuffer | undefined>
{
    const backgroundUrl = await getGameBackgroundApiUrlV2(gameId);

    return getEncodedWebMedia(backgroundUrl, 'base64');
}

export async function resolveGameBackground(
    svgData: SvgData,
    showRecentGameBg: boolean,
    showInGameBg: boolean,
    hasInGameName: boolean
): Promise<SvgGameBackgroundMetadata> 
{
    const { userData, recentGame } = svgData;

    // Priority 1: In-game background
    if (hasInGameName && showInGameBg && userData?.gameid) {
        const encodedBg = await fetchGameBackground(userData.gameid);
        
        return mapSvgGameBgMetadata(encodedBg, GAME_BG_DIMENSIONS);
    }

    // Priority 2: Recent game background
    if (!hasInGameName && showRecentGameBg && recentGame?.appid) {
        const encodedBg = await fetchGameBackground(recentGame.appid);

        return mapSvgGameBgMetadata(encodedBg, GAME_BG_DIMENSIONS);
    }

    // Fallback: Steam logo
    const fallbackBg = await getEncodedLocalMedia(join('dist', 'public', 'Steam-Logo-Transparent.png'));
    return mapSvgGameBgMetadata(fallbackBg, FALLBACK_BG_DIMENSIONS);
}


export async function fetchProfileBackground(
    profileBgData: SvgData['profileBgData']
): Promise<string | ArrayBuffer | undefined> 
{
    if (!('image_large' in profileBgData)) {
        return undefined;
    }

    return getEncodedWebMedia(
        getPublicImageApiUrl(profileBgData.image_large),
        'base64'
    );
}

export async function fetchAvatarFrame(
  avatarFrameData: SvgData['avatarFrameData'],
  useAnimated: boolean
): Promise<string | ArrayBuffer | undefined> 
{
    if (!('image_small' in avatarFrameData)) {
        return undefined;
    }

    const imageUrl = useAnimated
    ? avatarFrameData.image_large
    : avatarFrameData.image_small;

    return getEncodedWebMedia(
        getPublicImageApiUrl(imageUrl),
        'base64'
    );
}