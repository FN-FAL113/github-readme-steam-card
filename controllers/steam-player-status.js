
const NotFoundError = require('../errors/not-found')
const axios = require('axios');

const getStatus = async (req, res, next) => {
    const { steamid, last_played_bg, current_game_bg } = req.query;
    
    // conditionals for displaying current/last game background
    const displayLastPlayedGameBG = last_played_bg != undefined ? last_played_bg === "true" : true 
    const displayCurrentGameBG = current_game_bg != undefined ? current_game_bg === "true" : true
    
    // steam api user data url
    const userUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`
    // steam api user game data url
    const ownedGamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`
    // steam api user profile background url
    const profileBackgroundUrl = `http://api.steampowered.com/IPlayerService/GetProfileBackground/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}`
    // steam api user avatar frame url
    const avatarFrameUrl = `https://api.steampowered.com/IPlayerService/GetAvatarFrame/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}`

    try {
        const getUserData = await axios.get(userUrl)
        const userData = getUserData.data.response.players[0]
        
        const getLastGameData = await axios.get(ownedGamesUrl)
        const ownedGamesData = getLastGameData.data.response.games

        const getProfileBackground = await axios.get(profileBackgroundUrl)
        const profileBackgroundData = getProfileBackground.data.response.profile_background

        const getAvatarFrame = await axios.get(avatarFrameUrl)
        const avatarFrameData = getAvatarFrame.data.response.avatar_frame
      
        if (userData) {
            let user_status = null
            
            // check user status and create data from it
            if(userData.personastate === 1) {
                user_status = { status: "Online", statusColor: "#57cbde"}
            } else if (userData.personastate === 2) {
                user_status = "Busy"
            } else if (userData.personastate === 3) {
                user_status = { status: "Away", statusColor: "#57cbde"}
            } else {
                user_status = { status: "Offline", statusColor: "#898989" }
            }
                       
            const currentGame = !userData.gameextrainfo ? null : userData
            const recentGame = !ownedGamesData ? null : getRecentlyPlayedGameData(ownedGamesData)
            const profileBackground = Object.keys(profileBackgroundData).length == 0 ? null : profileBackgroundData
            const avatarFrame = Object.keys(avatarFrameData).length == 0 ? null : avatarFrameData
            const avatarImageBase64 = await getBase64Media(userData.avatarfull)
            const steamImageBase64 = await getBase64Media("https://www.pngmart.com/files/22/Steam-Logo-PNG-Transparent.png") // prone to stale resource

            const fetchedData = {
                name: userData.personaname,
                id: userData.steamid,
                user_status: user_status,
                avatar: avatarImageBase64,
                profileBackground: profileBackground,
                avatarFrame: avatarFrame,
                currentGame: currentGame,
                recentGame: recentGame,
                steamLogo: steamImageBase64
            }
        
            const svg = await initSvg(fetchedData, displayLastPlayedGameBG, displayCurrentGameBG)
            
            // serve from cache, but update it, if requested after 1 second
            res.set('Cache-Control', 's-maxage=1, stale-while-revalidate')
            res.set('Content-Type', 'image/svg+xml');
            res.status(200).send(svg);          
        } else {
            throw new NotFoundError('No user not found, verify your steam id')
        }
    } catch (error) {
       next(error)
    }
}

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

async function initSvg(fetchedData, displayLastPlayedGameBG, displayCurrentGameBG) {
    // user status (name and font color)
    const status = fetchedData.user_status.status
    const statusColor = fetchedData.user_status.statusColor
    
    // formatted names, defaults to null if no data
    const userName = fetchedData.name.length > 20 ? fetchedData.name.slice(0, 16) + '...' : fetchedData.name
    const currentGameName = fetchedData.currentGame ? 
        fetchedData.currentGame.gameextrainfo.length > 32 ? 
            fetchedData.currentGame.gameextrainfo.slice(0, 28) + '...' : fetchedData.currentGame.gameextrainfo 
        : null
    const recentGameName = fetchedData.recentGame ? 
        fetchedData.recentGame.name.length > 32 ? 
            fetchedData.recentGame.name.slice(0, 28) + '...' : fetchedData.recentGame.name 
        : null
    
    // should display current game background else default to steam logo if current game data are not available
    let currentGameBgMetaData = [fetchedData.steamLogo, "295", "10", "170px", "170px"]
    if(currentGameName && displayCurrentGameBG) {
        currentGameBgMetaData = [await getBase64Media(setGetGameBGUrl(fetchedData?.currentGame.gameid)), "266", "-10", "260px", "210px"]
    }
     
    // should display last played game background else default to steam logo if last game data are not available
    let recentGameBgMetaData = [fetchedData.steamLogo, "295", "10", "170px", "170px"]
    if(recentGameName && displayLastPlayedGameBG) {
        recentGameBgMetaData = [await getBase64Media(setGetGameBGUrl(fetchedData?.recentGame.appid)), "266", "-10", "260px", "210px"]
    }

    // profile background
    const profileBackgroundBase64 = fetchedData?.profileBackground?.image_large && 
        await getBase64Media(setPublicImageUrl(fetchedData.profileBackground.image_large))
    
    // avatar frame
    const avatarFrameBase64 = fetchedData?.avatarFrame && 
        await getBase64Media(setPublicImageUrl(fetchedData.avatarFrame.image_small)) 
    
    return `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="200">
            <g>
                <!-- main box container -->
                <rect width="600" height="200" fill="#1b2838" />    
                
                <!-- profile background -->
                ${
                fetchedData?.profileBackground?.image_large ? 
                    `
                        <image 
                            href="data:image/jpeg;base64,${profileBackgroundBase64}" 
                            x="-134"  
                            y="0"  
                            width="400" 
                            height="200" 
                            preserveAspectRatio="none" 
                            opacity="0.5" 
                        />
                    ` 
                :   ""
                }

                <!-- game status and image -->
                ${
                currentGameName ? 
                    `
                        <text x="158" y="144" font-size="14" fill="#a3cf06">In-Game</text>
                        <text x="158" y="159" font-size="16" fill="#a3cf06">${currentGameName}</text>
                        <image 
                            href="data:image/jpeg;base64,${currentGameBgMetaData[0]}" 
                            x="${currentGameBgMetaData[1]}"  
                            y="${currentGameBgMetaData[2]}"  
                            width="${currentGameBgMetaData[3]}" 
                            height="${currentGameBgMetaData[4]}" 
                            preserveAspectRatio="none" 
                            opacity="0.3" 
                        />
                    ` : 
                    recentGameName ? 
                    `
                        <text x="158" y="127" font-size="14" fill="#898989">Last Played</text>
                        <text x="158" y="142" font-size="16" fill="#898989">${recentGameName}</text>
                        <text x="158" y="162" font-size="14" fill="#898989">${parseInt(fetchedData.recentGame.playtime_forever / 60)} hrs</text>
                        <image 
                            href="data:image/jpeg;base64,${recentGameBgMetaData[0]}" 
                            x="${recentGameBgMetaData[1]}"  
                            y="${recentGameBgMetaData[2]}"  
                            width="${recentGameBgMetaData[3]}" 
                            height="${recentGameBgMetaData[4]}" 
                            preserveAspectRatio="none" 
                            opacity="0.325" 
                        />
                    ` 
                : 
                    `
                        <image 
                            href="data:image/png;base64,${fetchedData.steamLogo}" 
                            x="295" 
                            y="10" 
                            width="170px" 
                            height="170px" 
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
                    href="data:image/jpeg;base64,${fetchedData.avatar}"  
                />

                <!-- profile border frame -->
                ${
                    fetchedData?.avatarFrame ? 
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
                            stroke="${currentGameName ? `#a3cf06` : statusColor}" 
                            stroke-width="3" 
                            ${status == 'Away' ? `stroke-dasharray="3,3"`: ""} 
                        />
                    `
                }
                
                <!-- username -->
                <text x="157" y="62" font-size="20" fill="${statusColor}">${userName}</text>
                
                <!-- user status -->
                <text x="420" y="62" font-size="20" fill="${statusColor}">${status}</text>      
            </g>

            <style type="text/css">
                text { 
                    font-family: Arial, Helvetica, Verdana, sans-serif; 
                }
                
                video::-webkit-media-controls-panel {
                    display: none !important;
                    opacity: 1 !important;
                }

                video{
                    opacity: 0.475;
                } 
            </style>
        </svg> 
   `
}

async function getBase64Media(url) {
    const image = await axios.get(url, {
        responseType: 'text',
        responseEncoding: 'base64'
    })

    return image.data
}

function setPublicImageUrl(path) {
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/${path}`
}

function setGetGameBGUrl(gameId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`
}

module.exports = {
    getStatus
}
