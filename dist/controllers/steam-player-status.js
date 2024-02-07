"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const NotFoundError = require('../errors/not-found');
/**
 *
 * @param req express request object
 * @param res express response object
 * @param next express middleware function
 */
const getStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { query: { steamid, show_recent_game_bg, show_in_game_bg } } = req;
    // conditionals for displaying recent or in game background
    const showRecentGameBg = show_recent_game_bg != undefined ? show_recent_game_bg === 'true' : true;
    const showInGameBg = show_in_game_bg != undefined ? show_in_game_bg === 'true' : true;
    // steam api user data url
    const userUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`;
    // steam api user game data url
    const ownedGamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`;
    // steam api user equipped profile items url
    const equippedProfileItemsUrl = `https://api.steampowered.com/IPlayerService/GetProfileItemsEquipped/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}`;
    try {
        const getUserData = yield axios_1.default.get(userUrl);
        const userData = getUserData.data.response.players[0];
        if (userData) {
            const getOwnedGamesData = yield axios_1.default.get(ownedGamesUrl);
            const ownedGamesData = getOwnedGamesData.data.response.games;
            const equippedProfileItems = yield axios_1.default.get(equippedProfileItemsUrl);
            const profileBackgroundData = equippedProfileItems.data.response.profile_background;
            const avatarFrameData = equippedProfileItems.data.response.avatar_frame;
            let user_status = null;
            // check user status to initialize user status data
            if (userData.personastate === 1) {
                user_status = { status: 'Online', statusColor: '#57cbde' };
            }
            else if (userData.personastate === 2) {
                user_status = { status: 'Busy', statusColor: '#57cbde' };
            }
            else if (userData.personastate === 3) {
                user_status = { status: 'Away', statusColor: '#57cbde' };
            }
            else {
                user_status = { status: 'Offline', statusColor: '#898989' };
            }
            const recentGame = ownedGamesData ? getRecentlyPlayedGameData(ownedGamesData) : null;
            const profileBg = Object.keys(profileBackgroundData).length != 0 ? profileBackgroundData : null;
            const avatarFrame = Object.keys(avatarFrameData).length != 0 ? avatarFrameData : null;
            const avatarBase64 = yield getUrlMediaEncoded(userData.avatarfull, 'base64');
            const svgData = {
                userData,
                user_status,
                recentGame,
                profileBg,
                avatarFrame,
                avatarBase64,
            };
            const svg = yield initSvg(svgData, showRecentGameBg, showInGameBg);
            // serve a stale cache response while revalidating cache content for subsequent requests
            res.set('Cache-Control', 's-maxage=1, stale-while-revalidate');
            res.set('Content-Type', 'image/svg+xml');
            res.status(200).send(svg);
        }
        else {
            throw new NotFoundError('user not found');
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getStatus = getStatus;
/**
 * retrieves currently played game from an array of owned game data objects
 *
 * @param gamesArr array of owned game data objects
 * @returns the recently played game data object
 */
function getRecentlyPlayedGameData(gamesArr) {
    var _a, _b;
    let recentGameDataObj = null;
    // validate if user owned game playtime data can be accessed
    if (!((_a = gamesArr[0]) === null || _a === void 0 ? void 0 : _a.rtime_last_played) && !((_b = gamesArr[1]) === null || _b === void 0 ? void 0 : _b.rtime_last_played)) {
        return null;
    }
    // get recent game played by comparing time last played
    for (const gameDataObj of gamesArr) {
        if (!recentGameDataObj) { // initialize recent game data arr with first owned game data object
            recentGameDataObj = gameDataObj;
        }
        else if (gameDataObj.rtime_last_played > recentGameDataObj.rtime_last_played) {
            recentGameDataObj = gameDataObj;
        }
    }
    return recentGameDataObj;
}
/**
 * initialize and create svg markdown based from param data
 *
 * @param svgData object with data needed for initializing svg
 * @param showRecentGameBg show recent game background, defaults to true
 * @param showInGameBg show ingame background, defaults to true
 * @returns svg text markdown
 */
function initSvg(svgData, showRecentGameBg, showInGameBg) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        // user status (name and font color)
        const status = svgData.user_status.status;
        const statusColor = svgData.user_status.statusColor;
        const username = svgData.userData.personaname.length > 20 ? svgData.userData.personaname.slice(0, 16) + '...' : svgData.userData.personaname;
        const InGameName = ((_a = svgData.userData) === null || _a === void 0 ? void 0 : _a.gameextrainfo) ?
            ((_b = svgData.userData) === null || _b === void 0 ? void 0 : _b.gameextrainfo.length) > 32 ?
                ((_c = svgData.userData) === null || _c === void 0 ? void 0 : _c.gameextrainfo.slice(0, 28)) + '...'
                :
                    (_d = svgData.userData) === null || _d === void 0 ? void 0 : _d.gameextrainfo
            : null;
        const recentGameName = (svgData === null || svgData === void 0 ? void 0 : svgData.recentGame) ?
            svgData.recentGame.name.length > 32 ?
                svgData.recentGame.name.slice(0, 28) + '...'
                :
                    svgData.recentGame.name
            : null;
        let gameBgMetadata;
        if (InGameName && showInGameBg) {
            // if in game data and showIngameBg param is true then display game background else default to steam logo        
            gameBgMetadata = [yield getUrlMediaEncoded(setAndGetGameBgUrl(svgData.userData.gameid), 'base64'), '276', '-10', '285px', '210px'];
        }
        else if (!InGameName && recentGameName && showRecentGameBg) {
            // if recent game data and showRecentgameBg param is true then display game background else default to steam logo
            gameBgMetadata = [yield getUrlMediaEncoded(setAndGetGameBgUrl(svgData.recentGame.appid), 'base64'), '276', '-10', '285px', '210px'];
        }
        else {
            // fallback to steam logo
            gameBgMetadata = [yield getBase64LocalMedia((0, path_1.join)('public', 'Steam-Logo-Transparent.png')), '298', '10', '170px', '170px'];
        }
        // profile background
        let profileBgBase64;
        if ((svgData === null || svgData === void 0 ? void 0 : svgData.profileBg) && 'image_large' in svgData.profileBg) {
            const profileBackgroundData = svgData.profileBg;
            profileBgBase64 = yield getUrlMediaEncoded(setAndGetPublicImageUrl(profileBackgroundData.image_large), 'base64');
        }
        // avatar frame (animated/non-animated)
        // optimizing Animated PNG (APNG) not yet supported: https://github.com/lovell/sharp/issues/2375
        let avatarFrameBase64;
        if ((svgData === null || svgData === void 0 ? void 0 : svgData.avatarFrame) && 'image_small' in svgData.avatarFrame) {
            const avatarFrameData = svgData.avatarFrame;
            avatarFrameBase64 = yield getUrlMediaEncoded(setAndGetPublicImageUrl(avatarFrameData.image_small), 'base64');
        }
        return `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="200">
            <g>
                <!-- main box container -->
                <rect width="500" height="200" fill="#1b2838" />    
                
                <!-- profile background -->
                ${profileBgBase64 ?
            `
                        <image 
                            href="data:image/jpeg;base64,${profileBgBase64}" 
                            x="-124"  
                            y="0"  
                            width="400" 
                            height="200" 
                            preserveAspectRatio="none" 
                            opacity="0.410" 
                        />
                    `
            : ""}

                <!-- game name and background image, fallback to steam logo -->
                ${InGameName ?
            `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}" 
                            preserveAspectRatio="none" 
                            opacity="0.310" 
                        />
                        <text x="159" y="144" font-size="14" fill="#a3cf06">In-Game</text>
                        <text x="159" y="161" font-size="16" fill="#a3cf06">${InGameName}</text>
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
                            opacity="0.310"
                        />
                        <text x="159" y="127" font-size="14" fill="#898989">Last Played</text>
                        <text x="159" y="144" font-size="16" fill="#898989">${recentGameName}</text>
                        <text x="159" y="162" font-size="14" fill="#898989">${(svgData.recentGame.playtime_forever / 60).toFixed(1)} hrs playtime</text>
                    ` :
                `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}" 
                            preserveAspectRatio="none" 
                            opacity="0.310"
                        />
                    `}
                  
                <!-- profile image -->
                <image 
                    x="20" 
                    y="40" 
                    width="125px" 
                    height="125px" 
                    href="data:image/jpeg;base64,${svgData.avatarBase64}"  
                />

                <!-- profile border frame -->
                ${avatarFrameBase64 ?
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
                            ${status == 'Away' ? `stroke-dasharray="3,3"` : ""} 
                        />
                    `}
                
                <!-- username -->
                <text x="159" y="62" font-size="20" fill="${statusColor}">${username}</text>
                
                <!-- user status -->
                <text x="420" y="62" font-size="20" fill="${statusColor}">${status}</text>      
            </g>

            <style type="text/css">
                text { 
                    font-family: Arial, Helvetica, Verdana, sans-serif; 
                }
            </style>
        </svg> 
   `;
    });
}
/**
 * Fetch media from a given url
 * @param url web url (mime type: png, jpeg, gif, webp)
 * @param encoding encoding to use for response
 * @returns base64 string or array buffer
 */
function getUrlMediaEncoded(url, encoding) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const image = yield axios_1.default.get(url, {
                responseType: encoding === 'base64' ? 'text' : 'arraybuffer',
                responseEncoding: encoding === 'base64' ? 'base64' : 'binary'
            });
            return image.data;
        }
        catch (error) {
            console.error(error);
        }
    });
}
/**
 * Retrieve local media encoded as base64 string
 * @param path relative path of a media file
 * @returns base64 string
 */
function getBase64LocalMedia(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const imgBase64 = yield (0, promises_1.readFile)(path, { encoding: 'base64' });
            return imgBase64;
        }
        catch (error) {
            console.error(error);
        }
    });
}
/**
 * Retrieve public image asset url based from given url path segement/s
 * @param {string} path web url path segment/s
 * @returns {string} formed url
 */
function setAndGetPublicImageUrl(path) {
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/${path}`;
}
/**
 * Retrieve game background image asset url based from given game id
 * @param {string} path web url path segment
 * @returns {string} formed url
 */
function setAndGetGameBgUrl(gameId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`;
}
