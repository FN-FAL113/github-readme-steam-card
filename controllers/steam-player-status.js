
const NotFoundError = require('../errors/not-found')
const axios = require('axios');

const getStatus = async (req, res, next) => {
    const { steamid, last_played_bg, current_game_bg } = req.query;
    
    // conditionals for displaying current/last game background
    const displayLastPlayedGameBG = last_played_bg != undefined ? last_played_bg === "true" : true 
    const displayCurrentGameBG = current_game_bg != undefined ? current_game_bg === "true" : true
    
    // steam api user data url
    const userUrlResource = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`
    // steam api user game data url
    const gameUrlResource = `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&count=3`

    try {
        const response = await axios.get(userUrlResource)
        const userData = response.data.response.players[0]
        
        const response2 = await axios.get(gameUrlResource)
        const gameData = response2.data.response.games
      
        if (userData) {
            let user_status = null
            
            if(userData.personastate === 1) {
                user_status = ['Online', '#57cbde']
            } else if (userData.personastate === 2) {
                user_status = 'Busy'
            } else if (userData.personastate === 2) {
                user_status = ['Away', '#57cbde']
            } else {
                user_status = ['Offline', '#898989']
            }
            
            const currentGame = !userData.gameextrainfo ? null : [userData.gameextrainfo, userData.gameid];
            const lastGame = !gameData ? null : [gameData[0].name, gameData[0].appid, gameData[0].playtime_forever];
            const avatar = await getBase64Image(userData.avatarfull)
            const steamLogo = await getBase64Image("https://www.pngmart.com/files/22/Steam-Logo-PNG-Transparent.png") // prone to stale resource

            const fetchedData = {
                name: userData.personaname,
                id: userData.steamid,
                status: user_status,
                avatar: avatar,
                currentGame: currentGame,
                lastGame: lastGame,
                steamLogo: steamLogo
            }
        
            const svg = await initSvg(fetchedData, displayLastPlayedGameBG, displayCurrentGameBG)
            
            res.set('Content-Type', 'image/svg+xml');
            res.status(200).send(svg);          
        } else {
            throw new NotFoundError('No user not found, verify your steam id')
        }
    } catch (error) {
        console.log(error)
       next(error)
    }
}

async function initSvg(fetchedData, displayLastPlayedGameBG, displayCurrentGameBG) {
    // user status (name and font color)
    const status = fetchedData.status[0]
    const statusColor = fetchedData.status[1]
    
    // formatted names
    const userName = fetchedData.name.length > 20 ? fetchedData.name.slice(0, 16) + '...' : fetchedData.name
    const currentGameName = fetchedData.currentGame ? fetchedData.currentGame[0].length > 32 ? fetchedData.currentGame[0].slice(0, 28) + '...' : fetchedData.currentGame[0] : null
    const lastGameName = fetchedData.lastGame ? fetchedData.lastGame[0].length > 32 ? fetchedData.lastGame[0].slice(0, 28) + '...' : fetchedData.lastGame[0] : null
    
    // should display current game background
    const currentGameBase64Image = await getBase64Image(setGetGameBGUrl(fetchedData.currentGame[1]))
    const currentGameBg = displayCurrentGameBG ? 
                                    currentGameName ? currentGameBase64Image : fetchedData.steamLogo 
                                : 
                                    steamLogo
     
    // should display last played game background
    const lastPlayedBase64Image = await getBase64Image(setGetGameBGUrl(fetchedData.lastGame[1]))
    const lastPlayedBg = displayLastPlayedGameBG ? 
                                    lastGameName ? lastPlayedBase64Image : fetchedData.steamLogo 
                                : 
                                    fetchedData.steamLogo

    return `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="150">
            <g>
                <rect width="400" height="150" fill="#1b2838" />    
                
                ${
                currentGameName ? `
                    <text x="130" y="108" font-size="10" fill="#a3cf06">In-Game</text>
                    <text x="130" y="122" font-size="12" fill="#a3cf06">${currentGameName}</text>
                    <image href="data:image/jpeg;base64,${currentGameBg}" x="225" y="-10" width="200px" height="170px" preserveAspectRatio="none" opacity="0.325" />
                ` : 
                lastGameName ? `
                    <text x="130" y="96" font-size="10" fill="#898989">Last Played</text>
                    <text x="130" y="110" font-size="12" fill="#898989">${lastGameName}</text>
                    <text x="130" y="122" font-size="10" fill="#898989">${parseInt(fetchedData.lastGame[2] / 60)} hrs</text>
                    <image href="data:image/jpeg;base64,${lastPlayedBg}" x="225" y="-10" width="200px" height="170px" preserveAspectRatio="none" opacity="0.325" />
                    ` : `
                    <image href="href="data:image/png;base64,${fetchedData.steamLogo}"" x="230" y="-10" width="200px" height="170px" preserveAspectRatio="none" opacity="0.325" />
                ` 
                }
                
                <rect x="20" y="20" width="100px" height="100px" fill="none" stroke="${currentGameName ? `#a3cf06` : statusColor}" stroke-width="3" ${status == 'Away' ? `stroke-dasharray="3,3"`: ``} />
                <image href="data:image/jpeg;base64,${fetchedData.avatar}" x="20" y="20" width="100px" height="100px" />
                
                <text x="130" y="32" font-size="16" fill="${statusColor}">${userName}</text>
                <text x="330" y="32" font-size="16" fill="${statusColor}">${status}</text>      
            </g>

            <style type="text/css">
                text { font-family: Arial, Helvetica, Verdana, sans-serif; }
            </style>
        </svg> 
   `
}

async function getBase64Image(url) {
    const image = await axios.get(url, {
        responseType: 'text',
        responseEncoding: 'base64'
    })

    return image.data
}

function setGetGameBGUrl(gameId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`
}

module.exports = {
    getStatus
}