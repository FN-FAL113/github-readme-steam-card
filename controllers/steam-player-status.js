
const NotFoundError = require('../errors/not-found')
const chromiumPuppeteer = require('../bin/chromium-puppeteer')
const axios = require('axios');

const getStatus = async (req, res, next) => {
    const { steamid, last_played_bg, current_game_bg } = req.query;
    const lastPlayedBg = last_played_bg ? last_played_bg.toLowerCase() === 'true' : true
    const currentGameBg = current_game_bg ? current_game_bg.toLowerCase() === 'true' : true
    const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`
    const url2 = `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&count=3`

    try {
        const response = await axios.get(url)
        const data = response.data.response.players[0]
        const response2 = await axios.get(url2)
        const data2 = response2.data.response.games

        if (data) {
            const getStatus =
            data.personastate === 1
                ? ['Online', '#57cbde']
                : data.personastate === 2
                ? 'Busy'
                : data.personastate === 3
                ? ['Away', '#57cbde']
                : ['Offline', '#898989'];
            
            const currentGame = !data.gameextrainfo ? null : [data.gameextrainfo, data.gameid];
            const lastGame = !data2 ? null : [data2[0].name, data2[0].appid, data2[0].playtime_forever];
            
            const htmlData = {
                name: data.personaname,
                id: data.steamid,
                avatar: data.avatarfull,
                status: getStatus,
                currentGame: currentGame,
                lastGame: lastGame
            }

            const puppeteer = new chromiumPuppeteer()
            await puppeteer.launchBrowser()
            await puppeteer.newPage()
            await puppeteer.setPageContent(initSvg(htmlData, lastPlayedBg, currentGameBg))
            await puppeteer.setPageViewPort(400, 150)
            await puppeteer.waitForTimeout(1500)
            await puppeteer.screenshot()
            await puppeteer.closeBrowser()
        
            res.set('Content-Type', 'image/png');
            res.status(200).send(Buffer.from(puppeteer.getImage(), 'base64'));          
        } else {
            throw new NotFoundError('No user not found, verify your steam id')
        }
    } catch (error) {
       next(error)
    }
}

function initSvg(htmlData, last_played_bg, current_game_bg) {
    const status = htmlData.status[0]
    const statusColor = htmlData.status[1]
    const steamLogo = "https://www.pngmart.com/files/22/Steam-Logo-PNG-Transparent.png"
    
    const userName = htmlData.name.length > 20 ? htmlData.name.slice(0, 20) + '...' : htmlData.name
    const currentGame = htmlData.currentGame ? htmlData.currentGame[0].length > 32 ? htmlData.currentGame[0].slice(0, 32) + '...' : htmlData.currentGame[0] : null
    const lastGame = htmlData.lastGame ? htmlData.lastGame[0].length > 32 ? htmlData.lastGame[0].slice(0, 32) + '...' : htmlData.lastGame[0] : null
    
    const currentGameBg = current_game_bg ? currentGame ? getGameBackground(htmlData.currentGame[1]) : steamLogo : steamLogo
    const lastPlayedBg = last_played_bg ? lastGame ? getGameBackground(htmlData.lastGame[1]) : steamLogo : steamLogo

    return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="150">
        <g>
            <rect width="400" height="150" fill="#1b2838" />    
            
            ${currentGame ? `
            <text x="130" y="108" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="10" fill="#a3cf06">In-Game</text>
            <text x="130" y="122" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="12" fill="#a3cf06">${currentGame}</text>
            <image href="${currentGameBg}" x="230" y="-10" width="200px" height="170px" preserveAspectRatio="none" opacity="0.08" />
            ` : 
            lastGame ? `
            <text x="130" y="96" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="10" fill="#898989">Last Played</text>
            <text x="130" y="110" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="12" fill="#898989">${lastGame}</text>
            <text x="130" y="122" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="10" fill="#898989">${parseInt(htmlData.lastGame[2] / 60)} hrs</text>
            <image href="${lastPlayedBg}" x="230" y="-10" width="200px" height="170px" preserveAspectRatio="none" opacity="0.08" />
            ` : `
            <image href="${steamLogo}" x="230" y="-10" width="200px" height="170px" preserveAspectRatio="none" opacity="0.08" />
            ` 
            }
            <rect x="20" y="20" width="100px" height="100px" fill="none" stroke="${currentGame ? `#a3cf06` : statusColor}" stroke-width="3" ${status == 'Away' ? `stroke-dasharray="3,3"`: ``} />
            
            <image href="${htmlData.avatar}" x="20" y="20" width="100px" height="100px" />
            
            <text x="130" y="32" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="16" fill="${statusColor}">${userName}</text>
            <text x="330" y="32" font-family="Motiva Sans,Arial,Helvetica,sans-serif" font-size="16" fill="${statusColor}">${status}</text>      
        </g>
    </svg> 
    <style>
        svg {
            position: absolute;
            top: 0;
            left: 0;
        }
    </style>`
}

function getGameBackground(gameId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`
}

module.exports = {
    getStatus
}