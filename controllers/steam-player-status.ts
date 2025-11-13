
import { join } from 'path';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { RequestQueryParams } from '../types/request';
import { 
    AvatarFrameData,
    PlayerOwnedGameData,
    PlayerSummaryData,
    ProfileBackgroundData,
    SteamPlayerOwnedGamesData, 
    SteamPlayerSummariesData, 
    SteamPlayerEquippedProfileItemsData 
} from '../types/steam';
import { SvgData, SvgGameBackgroundMetadata } from '../types/misc';
import { getEncodedWebMedia, getEncodedLocalMedia } from '../helpers/media-helper';
import { getPublicImageApiUrl, getGameBackgroundApiUrlV2 } from '../helpers/api-url-helper';
import { buildSvg, mapSvgGameBgMetadata } from '../helpers/svg-helper';

const NotFoundError = require('../errors/not-found')

// Steam API resources
// https://steamapi.xpaw.me/
// https://developer.valvesoftware.com/wiki/Steam_Web_API
// https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI#appdetails

const getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { 
        query: { 
            steamid, 
            show_recent_game_bg, 
            show_in_game_bg, 
            animated_avatar 
        } 
    } = req as RequestQueryParams
    
    // conditions for displaying recent or in game background
    const showRecentGameBg: boolean = show_recent_game_bg != undefined ? show_recent_game_bg === 'true' : true 
    const showInGameBg: boolean = show_in_game_bg != undefined ? show_in_game_bg === 'true' : true
    
    // steam api user data url
    const userUrl: string = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`
    
    // steam api user game data url
    const ownedGamesUrl: string = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`
    
    // steam api user equipped profile items url
    const equippedProfileItemsUrl: string = `https://api.steampowered.com/IPlayerService/GetProfileItemsEquipped/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}`

    try {
        const getUserData: SteamPlayerSummariesData = await axios.get(userUrl)

        const userData: PlayerSummaryData = getUserData.data.response.players[0]

        if(userData) {
            const getOwnedGamesData: SteamPlayerOwnedGamesData = await axios.get(ownedGamesUrl)

            const ownedGamesData: PlayerOwnedGameData[] = getOwnedGamesData.data.response.games

            const equippedProfileItems: SteamPlayerEquippedProfileItemsData = await axios.get(equippedProfileItemsUrl)

            const profileBgData: ProfileBackgroundData|{} = equippedProfileItems.data.response.profile_background

            const avatarFrameData: AvatarFrameData|{} = equippedProfileItems.data.response.avatar_frame

            let user_status: { status: string, statusColor: string }|null = null
            
            // check user status to initialize user status data
            if(userData.personastate === 1) {
                user_status = { status: 'Online', statusColor: '#57cbde' }
            } else if (userData.personastate === 2) {
                user_status = { status: 'Busy', statusColor: '#57cbde' }
            } else if (userData.personastate === 3) {
                user_status = { status: 'Away', statusColor: '#57cbde' }
            } else {
                user_status = { status: 'Offline', statusColor: '#898989' }
            }        
       
            const recentGame: PlayerOwnedGameData|null = ownedGamesData ? getRecentlyPlayedGameData(ownedGamesData) : null  
            const avatarBase64: string|ArrayBuffer|undefined = await getAvatar(userData, equippedProfileItems, animated_avatar)
            
            const svgData: SvgData = {
                userData,
                user_status,
                recentGame,
                profileBgData,
                avatarFrameData,
                avatarBase64,
            }
        
            const svg = await initSvg(svgData, showRecentGameBg, showInGameBg, animated_avatar)
            
            // serve a stale cache response while revalidating cache content for subsequent requests
            res.set('Cache-Control', 's-maxage=1, stale-while-revalidate')
            res.set('Content-Type', 'image/svg+xml');
            res.status(200).send(svg);          
        } else {
            throw new NotFoundError('steam user not found')
        }
    } catch (error) {
        next(error)
    }
}

// check if user wants to use animated avatar if exists else fallback to non-animated avatar
async function getAvatar(
    userData: PlayerSummaryData, 
    equippedProfileItems: SteamPlayerEquippedProfileItemsData, 
    animated_avatar: string|undefined
): Promise<string|ArrayBuffer|undefined> 
{
    if (animated_avatar == "true" && 'image_small' in equippedProfileItems.data.response.animated_avatar) {
        return await getEncodedWebMedia(
            getPublicImageApiUrl(equippedProfileItems.data.response.animated_avatar.image_small),
            'base64'
        )
    }

    return await getEncodedWebMedia(userData.avatarfull, 'base64')
}

function getRecentlyPlayedGameData(gamesArr: PlayerOwnedGameData[]): PlayerOwnedGameData|null 
{
    // validate if user owned game playtime data can be accessed
    if (! gamesArr[0]?.rtime_last_played && ! gamesArr[1]?.rtime_last_played) {
        return null
    }

    let recentGameDataObj: PlayerOwnedGameData|null = null

    // get user recent game played by comparing time last played
    for (const gameDataObj of gamesArr) {
        if (! recentGameDataObj) { // initialize recent game data arr with first owned game data object
            recentGameDataObj = gameDataObj
        } else if (gameDataObj.rtime_last_played! > recentGameDataObj.rtime_last_played!) {
            recentGameDataObj = gameDataObj
        }
    }
        
    return recentGameDataObj
}

async function initSvg(
    svgData: SvgData, 
    showRecentGameBg: boolean, 
    showInGameBg: boolean, 
    animated_avatar: string|undefined
): Promise<string> 
{
    // user status (name and font color)
    const status: string = svgData.user_status.status

    const statusColor: string = svgData.user_status.statusColor
    
    const username: string = svgData.userData.personaname.length > 20 ? 
        svgData.userData.personaname.slice(0, 16) + '...' : svgData.userData.personaname
    
    const inGameName: string|null = svgData.userData?.gameextrainfo ? 
            svgData.userData?.gameextrainfo.length > 32 ? 
                svgData.userData?.gameextrainfo.slice(0, 25) + '...' 
            :   
                svgData.userData?.gameextrainfo 
        : null
    
    const recentGameName: string|null = svgData?.recentGame ? 
            svgData.recentGame.name.length > 32 ? 
                svgData.recentGame.name.slice(0, 26) + '...' 
            : 
                svgData.recentGame.name 
        : null
    
    // in-game or recent game background, it fallbacks to steam logo
    // seems to be that other games are cached on fastly that requires the hashed resource endpoint which we can't access through available steam game api
    // eg. `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3478050/3b653f6352ba1e603205721e20ab370ed4caf1de/header.jpg?t=1762397148`
    // if the game bg cannot be fetched from steam cloudflare cdn using game id then it will display a malformed image  
    // but I just found an alternative way after doing some exploration where game header image can be accessed easily
    // eg. https://store.steampowered.com/api/appdetails?appids=3478050&filters=basic
    let svgGameBgMetadata: SvgGameBackgroundMetadata;

    if (inGameName && showInGameBg) {
        // if in game data is present and showIngameBg param is true then display game background       
        svgGameBgMetadata = mapSvgGameBgMetadata(
            await getEncodedWebMedia(
                await getGameBackgroundApiUrlV2(svgData.userData.gameid as string),
                'base64'
            ),
            '350',
            '68',
            '128px',
            '128px'
        )
    } else if (! inGameName && recentGameName && showRecentGameBg) {
        // if not in game, recent game data is present and showRecentgameBg param is true then display game background
        svgGameBgMetadata = mapSvgGameBgMetadata(
            await getEncodedWebMedia(
                await getGameBackgroundApiUrlV2(svgData.recentGame!.appid),
                'base64'
            ),
            '350',
            '68',
            '128px',
            '128px'
        )
    }  else {
        // fallback to steam logo
        svgGameBgMetadata = mapSvgGameBgMetadata(await getEncodedLocalMedia(join('dist', 'public', 'Steam-Logo-Transparent.png')), '414', '100', '64px', '64px')
    } 
    
    // profile equipped background
    let profileBgBase64: string|ArrayBuffer|undefined;

    if ('image_large' in svgData.profileBgData) {
        profileBgBase64 = await getEncodedWebMedia(getPublicImageApiUrl(svgData.profileBgData.image_large), 'base64')
    }
    
    // avatar frame (static or animated)
    // optimizing Animated PNG (APNG) not yet supported: https://github.com/lovell/sharp/issues/2375
    let avatarFrameBase64: string|ArrayBuffer|undefined;

    if ('image_small' in svgData.avatarFrameData) {
        const url = animated_avatar == "true" ? svgData.avatarFrameData.image_large : svgData.avatarFrameData.image_small

        avatarFrameBase64 = await getEncodedWebMedia(getPublicImageApiUrl(url), 'base64')
    }
    
    return buildSvg(svgData, svgGameBgMetadata, profileBgBase64, avatarFrameBase64, inGameName, recentGameName, username, status, statusColor)
}

export {
    getStatus
}