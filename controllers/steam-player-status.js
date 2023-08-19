const { readFile } = require('fs').promises
const { join } = require('path')
const NotFoundError = require('../errors/not-found')
const axios = require('axios');


/**
 * 
 * @param {Express.Request} req express request object
 * @param {Express.Response} res express response object
 * @param {Express.NextFunction} next express middleware function
 */
const getStatus = async (req, res, next) => {
    const { steamid, show_recent_game_bg, show_in_game_bg } = req.query;
    
    // conditionals for displaying recent or in game background
    const showRecentGameBg = show_recent_game_bg != undefined ? show_recent_game_bg === 'true' : true 
    const showInGameBg = show_in_game_bg != undefined ? show_in_game_bg === 'true' : true
    
    // steam api user data url
    const userUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`
    // steam api user game data url
    const ownedGamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`
    // steam api user equipped profile items url
    const equippedProfileItemsUrl = `https://api.steampowered.com/IPlayerService/GetProfileItemsEquipped/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}`

    try {
        const getUserData = await axios.get(userUrl)
        const userData = getUserData.data.response.players[0]

        if (userData) {
            const getLastGameData = await axios.get(ownedGamesUrl)
            const ownedGamesData = getLastGameData.data.response.games

            const equippedProfileItems = await axios.get(equippedProfileItemsUrl)
            const profileBackgroundData = equippedProfileItems.data.response.profile_background
            const avatarFrameData = equippedProfileItems.data.response.avatar_frame

            let user_status = null
            
            // check user status to initialize user status data
            if(userData.personastate === 1) {
                user_status = { status: 'Online', statusColor: '#57cbde' }
            } else if (userData.personastate === 2) {
                user_status = 'Busy'
            } else if (userData.personastate === 3) {
                user_status = { status: 'Away', statusColor: '#57cbde' }
            } else {
                user_status = { status: 'Offline', statusColor: '#898989' }
            }        
       
            const currentGame = userData.gameextrainfo ? userData : null
            const recentGame = ownedGamesData ? getRecentlyPlayedGameData(ownedGamesData) : null 
            const profileBg = Object.keys(profileBackgroundData).length != 0 ? profileBackgroundData : null 
            const avatarFrame = Object.keys(avatarFrameData).length != 0 ? avatarFrameData : null
            const avatarBase64 = await getUrlMediaEncoded(userData.avatarfull, 'base64')
            
            const fetchedData = {
                name: userData.personaname,
                id: userData.steamid,
                user_status: user_status,
                avatarBase64: avatarBase64,
                profileBg: profileBg,
                avatarFrame: avatarFrame,
                currentGame: currentGame,
                recentGame: recentGame,
            }
        
            const svg = await initSvg(fetchedData, showRecentGameBg, showInGameBg)
            
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

/**
 * Process array of object to retrieve recent game data
 * @param {array<Object>} gamesArr array of game objects with data props
 * @returns {Object | null} the object for recent game
 */
function getRecentlyPlayedGameData(gamesArr){
    let recentGameDataObj = null

    // get recent game played by comparing time last played
    for (const gameDataObj of gamesArr) {
        if(!recentGameDataObj){
            recentGameDataObj = gameDataObj
        } else if(gameDataObj.rtime_last_played > recentGameDataObj.rtime_last_played) {
            recentGameDataObj = gameDataObj
        }
    }
        
    return recentGameDataObj
}

/**
 * Initialize and create svg markdown based from param data
 * @param {Object} fetchedData object with data needed for initializing svg
 * @param {boolean} showRecentGameBg show recent game background, defaults to true
 * @param {boolean} showInGameBg show ingame background, defaults to true
 * @returns {string} svg text markdown
 */
async function initSvg(fetchedData, showRecentGameBg, showInGameBg) {
    // user status (name and font color)
    const status = fetchedData.user_status.status
    const statusColor = fetchedData.user_status.statusColor
    
    // formatted user/game name, defaults to null if json data is empty
    const userName = fetchedData.name.length > 20 ? fetchedData.name.slice(0, 16) + '...' : fetchedData.name
    
    const InGameName = fetchedData.currentGame ? 
            fetchedData.currentGame.gameextrainfo.length > 32 ? 
                fetchedData.currentGame.gameextrainfo.slice(0, 28) + '...' 
            :   
                fetchedData.currentGame.gameextrainfo 
        : null
    
    const recentGameName = fetchedData.recentGame ? 
            fetchedData.recentGame.name.length > 32 ? 
                fetchedData.recentGame.name.slice(0, 28) + '...' 
            : 
                fetchedData.recentGame.name 
        : null
    
    
    let gameBgMetadata = null
    if(InGameName && showInGameBg) {
        // if in game data and showIngameBg param is true then display game background else default to steam logo        
        gameBgMetadata = [await getUrlMediaEncoded(setAndGetGameBgUrl(fetchedData.currentGame.gameid), 'base64'), '283', '-10', '285px', '210px']
    } else if(recentGameName && showRecentGameBg) {
        // if recent game data and showRecentgameBg param is true then display game background else default to steam logo
        gameBgMetadata = [await getUrlMediaEncoded(setAndGetGameBgUrl(fetchedData.recentGame.appid), 'base64'), '283', '-10', '285px', '210px']
    }  else {
        // fallback to steam logo
        gameBgMetadata = [await getBase64LocalMedia(join('public', 'Steam-Logo-Transparent.png')), '305', '10', '170px', '170px']
    } 
    
    // profile background
    let profileBgBase64 = null;
    if(fetchedData?.profileBg?.image_large) {
        profileBgBase64 = await getUrlMediaEncoded(setAndGetPublicImageUrl(fetchedData.profileBg.image_large), 'base64')
    }
    
    // avatar frame (animated or non animated)
    // optimizing Animated PNG not yet supported: https://github.com/lovell/sharp/issues/2375
    const avatarFrameBase64 = fetchedData?.avatarFrame ?
        await getUrlMediaEncoded(setAndGetPublicImageUrl(fetchedData.avatarFrame.image_small), 'base64') : null
    
    return `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="200">
            <g>
                <!-- main box container -->
                <rect width="500" height="200" fill="#1b2838" />    
                
                <!-- profile background -->
                ${
                profileBgBase64 ? 
                    `
                        <image 
                            href="data:image/jpeg;base64,${profileBgBase64}" 
                            x="-116"  
                            y="0"  
                            width="400" 
                            height="200" 
                            preserveAspectRatio="none" 
                            opacity="0.525" 
                        />
                    ` 
                :   ""
                }

                <!-- game name and background image, fallback to steam logo -->
                ${
                InGameName ?
                    `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}" 
                            preserveAspectRatio="none" 
                            opacity="0.325" 
                        />
                        <text x="158" y="144" font-size="14" fill="#a3cf06">In-Game</text>
                        <text x="158" y="161" font-size="16" fill="#a3cf06">${InGameName}</text>
                    ` : 
                    recentGameName ? 
                    `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}" 
                            preserveAspectRatio="none" 
                            opacity="0.325"
                        />
                        <text x="158" y="127" font-size="14" fill="#898989">Last Played</text>
                        <text x="158" y="144" font-size="16" fill="#898989">${recentGameName}</text>
                        <text x="158" y="162" font-size="14" fill="#898989">${parseInt(fetchedData.recentGame.playtime_forever / 60)} hrs playtime</text>
                    ` : 
                    `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}" 
                            preserveAspectRatio="none" 
                            opacity="0.325"
                        />
                    `  
                }
                  
                <!-- profile image -->
                <image 
                    x="20" 
                    y="40" 
                    width="125px" 
                    height="125px" 
                    href="data:image/jpeg;base64,${fetchedData.avatarBase64}"  
                />

                <!-- profile border frame -->
                ${
                    avatarFrameBase64 ? 
                    `
                        <image 
                            href="data:image/png;base64,${avatarFrameBase64}" 
                            x="10"  
                            y="26"  
                            width="148px" 
                            height="152px" 
                            preserveAspectRatio="none" 
                        />
                    `
                :
                    `
                        <rect 
                            x="20"
                            y="40" 
                            width="125px" 
                            height="125px" 
                            fill="none" 
                            stroke="${InGameName ? `#a3cf06` : statusColor}" 
                            stroke-width="3" 
                            ${status == 'Away' ? `stroke-dasharray="3,3"`: ""} 
                        />
                    `
                }
                
                <!-- username -->
                <text x="158" y="62" font-size="20" fill="${statusColor}">${userName}</text>
                
                <!-- user status -->
                <text x="420" y="62" font-size="20" fill="${statusColor}">${status}</text>      
            </g>

            <style type="text/css">
                text { 
                    font-family: Arial, Helvetica, Verdana, sans-serif; 
                }
            </style>
        </svg> 
   `
}

/**
 * Fetch media from a given url
 * @param {string} url web url (mime type: png, jpeg, gif, webp) 
 * @param {string} encoding encoding to use for response
 * @returns {string | ArrayBuffer} base64 string or array buffer
 */
async function getUrlMediaEncoded(url, encoding) {
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

/**
 * Retrieve local media encoded as base64 string
 * @param {string} path relative path of a media file 
 * @returns {string} base64 string
 */
async function getBase64LocalMedia(path) {
    try {
        const imgBase64 = await readFile(path, { encoding: 'base64' })

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
function setAndGetPublicImageUrl(path) {
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/${path}`
}

/**
 * Retrieve game background image asset url based from given game id
 * @param {string} path web url path segment
 * @returns {string} formed url
 */
function setAndGetGameBgUrl(gameId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`
}

module.exports = {
    getStatus
}