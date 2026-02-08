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
import { SvgData } from '../types/misc';
import { fetchEncodedWebMedia, fetchAvatarFrame, fetchProfileBackground, resolveGameBackground, fetchAvatar } from '../helpers/media-helper';
import { getPublicImageApiUrl } from '../helpers/api-url-helper';
import { buildSvg, truncateText } from '../helpers/svg-helper';
import { TEXT_LIMITS } from '../types/contants';

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
    
    // condition for displaying recent or in-game image
    const showRecentGameBg: boolean = show_recent_game_bg != null ? Boolean(show_recent_game_bg) : true;  
    const showInGameBg: boolean = show_in_game_bg != null ? Boolean(show_in_game_bg) : true; 
    
    // steam api user data url
    const userUrl: string = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`
    
    // steam api user game data url
    const ownedGamesUrl: string = 
        `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`
    
    // steam api user equipped profile items url
    const equippedProfileItemsUrl: string = `https://api.steampowered.com/IPlayerService/GetProfileItemsEquipped/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}`

    try {
        const [getUserData, getOwnedGamesData, equippedProfileItems]: [
                SteamPlayerSummariesData, SteamPlayerOwnedGamesData, SteamPlayerEquippedProfileItemsData
            ] = await Promise.all([
                await axios.get(userUrl),
                await axios.get(ownedGamesUrl),
                await axios.get(equippedProfileItemsUrl)
            ]);

        if (getUserData.data.response.players[0]) {
            const userData: PlayerSummaryData = getUserData.data.response.players[0]

            const ownedGamesData: PlayerOwnedGameData[] = getOwnedGamesData.data.response.games

            const profileBgData: ProfileBackgroundData|{} = equippedProfileItems.data.response.profile_background

            const avatarFrameData: AvatarFrameData|{} = equippedProfileItems.data.response.avatar_frame

            let user_status: { status: string, statusColor: string }|null = { status: 'Offline', statusColor: '#57cbde' }
            
            // initialize user status data
            if(userData.personastate === 1) {
                user_status['status'] = 'Online'
            } else if (userData.personastate === 2) {
                user_status['status'] = 'Busy'
            } else if (userData.personastate === 3) {
                user_status['status'] = 'Away'
            } else {
                // default to offline with gray font color
                user_status['statusColor'] = '#898989'
            }        
       
            const recentGame: PlayerOwnedGameData|null = ownedGamesData ? getRecentlyPlayedGameData(ownedGamesData) : null  
            const avatarBase64: string|ArrayBuffer|undefined = await fetchAvatar(userData, equippedProfileItems, animated_avatar)
            
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

function getRecentlyPlayedGameData(gamesArr: PlayerOwnedGameData[]): PlayerOwnedGameData|null 
{
    // validate if playtime data can be accessed
    if (! gamesArr[0]?.rtime_last_played && ! gamesArr[1]?.rtime_last_played) {
        return null
    }

    let recentGameDataObj: PlayerOwnedGameData|null = null

    // get recent game played by comparing time last played
    for (const gameDataObj of gamesArr) {
        if (! recentGameDataObj) {
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
    const { user_status, userData, recentGame, profileBgData, avatarFrameData } = svgData;

    const status = user_status.status;
    const statusColor = user_status.statusColor;
    
    const username = truncateText(userData.personaname, {
        maxLength: TEXT_LIMITS.USERNAME,
        truncateAt: TEXT_LIMITS.USERNAME_TRUNCATE,
    });

    const inGameName = truncateText(userData.gameextrainfo, {
        maxLength: TEXT_LIMITS.GAME_NAME,
        truncateAt: TEXT_LIMITS.IN_GAME_TRUNCATE,
    });

    const recentGameName = truncateText(recentGame?.name, {
        maxLength: TEXT_LIMITS.GAME_NAME,
        truncateAt: TEXT_LIMITS.RECENT_GAME_TRUNCATE,
    });
    
    // fetch all assets in parallel for better performance
    const [svgGameBgMetadata, profileBgBase64, avatarFrameBase64] = await Promise.all([
        resolveGameBackground(svgData, showRecentGameBg, showInGameBg, !!inGameName),
        fetchProfileBackground(profileBgData),
        fetchAvatarFrame(avatarFrameData, animated_avatar === 'true'),
    ]);
    
    return buildSvg(
        svgData,
        svgGameBgMetadata,
        profileBgBase64,
        avatarFrameBase64,
        inGameName,
        recentGameName,
        username,
        status,
        statusColor
    )
}

export {
    getStatus
}