import { readFile } from 'fs/promises';
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

const NotFoundError = require('../errors/not-found')

const getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { query: { steamid, show_recent_game_bg, show_in_game_bg, animated_avatar } } = req as RequestQueryParams
    
    // conditionals for displaying recent or in game background
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
            const profileBgData: ProfileBackgroundData | {} = equippedProfileItems.data.response.profile_background
            const avatarFrameData: AvatarFrameData | {} = equippedProfileItems.data.response.avatar_frame

            let user_status: { status: string, statusColor: string } | null = null
            
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
       
            const recentGame: PlayerOwnedGameData | null = ownedGamesData ? getRecentlyPlayedGameData(ownedGamesData) : null  
            const avatarBase64: string | ArrayBuffer | undefined = await getAvatar(userData, equippedProfileItems, animated_avatar)
            
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
            throw new NotFoundError('user not found')
        }
    } catch (error) {
        next(error)
    }
}

// check if user wants to use animated avatar if exists else fallback to non-animated avatar
async function getAvatar(userData: PlayerSummaryData, equippedProfileItems: SteamPlayerEquippedProfileItemsData, animated_avatar: string | undefined): Promise<string | ArrayBuffer | undefined> {
    if(animated_avatar == "true" && 'image_small' in equippedProfileItems.data.response.animated_avatar) {
        return await getUrlMediaEncoded(setAndGetPublicImageUrl(equippedProfileItems.data.response.animated_avatar.image_small), 'base64')
    }

    return await getUrlMediaEncoded(userData.avatarfull, 'base64')
}

function getRecentlyPlayedGameData(gamesArr: PlayerOwnedGameData[]): PlayerOwnedGameData | null {
    let recentGameDataObj: PlayerOwnedGameData | null = null

    // validate if user owned game playtime data can be accessed
    if(!gamesArr[0]?.rtime_last_played && !gamesArr[1]?.rtime_last_played) {
        return null
    }

    // get recent game played by comparing time last played
    for (const gameDataObj of gamesArr) {
        if(!recentGameDataObj) { // initialize recent game data arr with first owned game data object
            recentGameDataObj = gameDataObj
        } else if(gameDataObj.rtime_last_played! > recentGameDataObj.rtime_last_played!) {
            recentGameDataObj = gameDataObj
        }
    }
        
    return recentGameDataObj
}

async function initSvg(svgData: SvgData, showRecentGameBg: boolean, showInGameBg: boolean, animated_avatar: string | undefined): Promise<string> {
    // user status (name and font color)
    const status: string = svgData.user_status.status
    const statusColor: string = svgData.user_status.statusColor
    
    const username: string = svgData.userData.personaname.length > 20 ? svgData.userData.personaname.slice(0, 16) + '...' : svgData.userData.personaname
    
    const inGameName: string | null = svgData.userData?.gameextrainfo ? 
            svgData.userData?.gameextrainfo.length > 32 ? 
                svgData.userData?.gameextrainfo.slice(0, 26) + '...' 
            :   
                svgData.userData?.gameextrainfo 
        : null
    
    const recentGameName: string | null = svgData?.recentGame ? 
            svgData.recentGame.name.length > 32 ? 
                svgData.recentGame.name.slice(0, 26) + '...' 
            : 
                svgData.recentGame.name 
        : null
    
    let gameBgMetadata: SvgGameBackgroundMetadata;

    if(inGameName && showInGameBg) {
        // if in game data and showIngameBg param is true then display game background else default to steam logo        
        gameBgMetadata = [await getUrlMediaEncoded(setAndGetGameBgUrl(svgData.userData.gameid as string), 'base64'), '350', '80', '128px', '128px']
    } else if(!inGameName && recentGameName && showRecentGameBg) {
        // if recent game data and showRecentgameBg param is true then display game background else default to steam logo
        gameBgMetadata = [await getUrlMediaEncoded(setAndGetGameBgUrl(svgData.recentGame!.appid), 'base64'), '350', '75', '128px', '128px']
    }  else {
        // fallback to steam logo
        gameBgMetadata = [await getBase64LocalMedia(join('public', 'Steam-Logo-Transparent.png')), '414', '100', '64px', '64px']
    } 
    
    // profile background
    let profileBgBase64: string | ArrayBuffer | undefined;

    if('image_large' in svgData.profileBgData) {
        profileBgBase64 = await getUrlMediaEncoded(setAndGetPublicImageUrl(svgData.profileBgData.image_large), 'base64')
    }
    
    // avatar frame (animated/non-animated)
    // optimizing Animated PNG (APNG) not yet supported: https://github.com/lovell/sharp/issues/2375
    let avatarFrameBase64: string | ArrayBuffer | undefined;

    if('image_small' in svgData.avatarFrameData) {
        const url = animated_avatar == "true" ? svgData.avatarFrameData.image_large : svgData.avatarFrameData.image_small

        avatarFrameBase64 = await getUrlMediaEncoded(setAndGetPublicImageUrl(url), 'base64')
    }
    
    return `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="200">
            <g>
                <!-- main box container -->
                <rect width="500" height="200" fill="#1b2838" rx="8" ry="8" />    
                
                <!-- profile background -->
                ${profileBgBase64 ? 
                    `
                        <image 
                            href="data:image/jpeg;base64,${profileBgBase64}" 
                            x="0"  
                            y="0"  
                            width="500" 
                            height="200" 
                            preserveAspectRatio="none" 
                            opacity="0.4" 
                        />
                    ` 
                :  
                    ""
                }

                <!-- game name and background image, fallback to steam logo -->
                ${inGameName ?
                    `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}"
                        />
                        <text x="160" y="144" font-size="12" fill="#a3cf06" class="game-header-status">In-Game</text>
                        <text x="160" y="161" font-size="16" fill="#a3cf06">${inGameName}</text>
                    ` : 
                    recentGameName ? 
                    `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}" 
                        />
                        <text x="160" y="120" font-size="12" fill="#898989" class="game-header-status">Last Played</text>
                        <text x="160" y="140" font-size="14" fill="#898989">${recentGameName}</text>
                        <text x="160" y="158" font-size="12" fill="#898989">${(svgData.recentGame!.playtime_forever / 60).toFixed(1)} hours played</text>
                    ` : 
                    `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}"
                        />
                    `  
                }
                  
                <!-- profile image -->
                <image 
                    x="20" 
                    y="36" 
                    width="125px" 
                    height="125px" 
                    href="data:image/jpeg;base64,${svgData.avatarBase64}"  
                />

                <!-- profile border frame -->
                ${
                    avatarFrameBase64 ? 
                    `
                        <image 
                            href="data:image/png;base64,${avatarFrameBase64}" 
                            x="6"  
                            y="22"  
                            width="152px" 
                            height="152px" 
                            preserveAspectRatio="none" 
                        />
                    `
                :
                    `
                        <rect 
                            x="20"
                            y="36" 
                            width="125px" 
                            height="125px" 
                            fill="none" 
                            stroke="${inGameName ? `#a3cf06` : statusColor}" 
                            stroke-width="3" 
                            ${status == 'Away' ? `stroke-dasharray="3,3"`: ""} 
                        />
                    `
                }
                
                <!-- username -->
                <text x="160" y="56" font-size="16" fill="${statusColor}">${username}</text>
                
                <!-- user status -->
                <text x="430" y="56" font-size="16" fill="${statusColor}">${status}</text>      
            </g>

            <style type="text/css">
                svg {
                    border-radius: 8px;
                }

                text { 
                    font-family: Arial, Helvetica, Verdana, sans-serif; 
                    text-shadow: 1px 2px 4px black;
                }
            </style>
        </svg> 
   `
}

async function getUrlMediaEncoded(url: string, encoding: string): Promise<string | ArrayBuffer | undefined> {
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

async function getBase64LocalMedia(path: string): Promise<string | undefined> {
    try {
        const imgBase64: string = await readFile(path, { encoding: 'base64' })

        return imgBase64
    } catch (error) {
        console.error(error)
    }
}

/**
 * Retrieve public image asset url based from given url path segement/s
 * @param {string} path web url path segment/s 
 * @returns {string} formed url
 */
function setAndGetPublicImageUrl(path: string): string {
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/${path}`
}

/**
 * Retrieve game background image asset url based from given game id
 * @param {string} path web url path segment
 * @returns {string} formed url
 */
function setAndGetGameBgUrl(gameId: string | number): string {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`
}

export {
    getStatus
}