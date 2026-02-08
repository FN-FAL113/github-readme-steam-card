import { readFile } from 'fs/promises';
import { join } from 'path';
import axios from 'axios';
import { getGameBackgroundApiUrlV2, getPublicImageApiUrl } from './api-url-helper';
import { mapSvgGameBgMetadata } from './svg-helper';
import { SvgGameBackgroundMetadata, SvgData } from '../types/misc';
import { GAME_BG_DIMENSIONS, FALLBACK_BG_DIMENSIONS } from '../types/contants';
import { PlayerSummaryData, SteamPlayerEquippedProfileItemsData } from '../types/steam';

export async function fetchEncodedWebMedia(url: string, encoding: string): Promise<string|ArrayBuffer|undefined>
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

export async function fetchEncodedLocalMedia(path: string): Promise<string|undefined> 
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

    return fetchEncodedWebMedia(backgroundUrl, 'base64');
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
    const fallbackBg = await fetchEncodedLocalMedia(join('dist', 'public', 'Steam-Logo-Transparent.png'));
    return mapSvgGameBgMetadata(fallbackBg, FALLBACK_BG_DIMENSIONS);
}


export async function fetchProfileBackground(
    profileBgData: SvgData['profileBgData']
): Promise<string | ArrayBuffer | undefined> 
{
    if (!('image_large' in profileBgData)) {
        return undefined;
    }

    return fetchEncodedWebMedia(
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

    return fetchEncodedWebMedia(
        getPublicImageApiUrl(imageUrl),
        'base64'
    );
}

// check if user wants to use animated avatar if exists else fallback to non-animated avatar
export async function fetchAvatar(
    userData: PlayerSummaryData, 
    equippedProfileItems: SteamPlayerEquippedProfileItemsData, 
    animated_avatar: string|undefined
): Promise<string|ArrayBuffer|undefined> 
{
    if (animated_avatar == "true" && 'image_small' in equippedProfileItems.data.response.animated_avatar) {
        return await fetchEncodedWebMedia(
            getPublicImageApiUrl(equippedProfileItems.data.response.animated_avatar.image_small),
            'base64'
        )
    }

    return await fetchEncodedWebMedia(userData.avatarfull, 'base64')
}