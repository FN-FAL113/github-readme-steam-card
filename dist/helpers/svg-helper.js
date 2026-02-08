"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateText = exports.mapSvgGameBgMetadata = exports.buildSvg = void 0;
function buildSvg(svgData, svgGameBgMetadata, profileBgBase64, avatarFrameBase64, inGameName, recentGameName, username, status, statusColor) {
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
                        ` : ""}

                <!-- game name and background image, fallback to steam logo -->
                ${inGameName ?
        `
                            <image 
                                href="data:image/jpeg;base64,${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.encodedMedia}" 
                                x="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.positionX}"  
                                y="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.positionY}"  
                                width="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.width}" 
                                height="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.height}"
                            />
                            <text x="160" y="130" font-size="12" fill="#a3cf06" class="game-header-status">In-Game</text>
                            <text x="160" y="150" font-size="14" fill="#a3cf06">${inGameName}</text>
                        ` :
        recentGameName ?
            `
                            <image 
                                href="data:image/jpeg;base64,${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.encodedMedia}" 
                                x="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.positionX}"  
                                y="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.positionY}"  
                                width="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.width}" 
                                height="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.height}" 
                            />
                            <text x="160" y="120" font-size="12" fill="#898989" class="game-header-status">Last Played</text>
                            <text x="160" y="140" font-size="14" fill="#898989">${recentGameName}</text>
                            <text x="160" y="158" font-size="12" fill="#898989">${(svgData.recentGame.playtime_forever / 60).toFixed(1)} hours played</text>
                        ` :
            `
                            <image 
                                href="data:image/jpeg;base64,${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.encodedMedia}" 
                                x="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.positionX}"  
                                y="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.positionY}"  
                                width="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.width}" 
                                height="${svgGameBgMetadata === null || svgGameBgMetadata === void 0 ? void 0 : svgGameBgMetadata.height}"
                            />
                        `}
                  
                <!-- profile image -->
                <image 
                    x="20" 
                    y="36" 
                    width="125px" 
                    height="125px" 
                    href="data:image/jpeg;base64,${svgData.avatarBase64}"  
                />

                <!-- profile border frame -->
                ${avatarFrameBase64 ?
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
                            ${status == 'Away' ? `stroke-dasharray="3,3"` : ""} 
                        />
                    `}
                
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
                    text-shadow: 1px 2px 8px rgba(0,0,0,1);
                }
            </style>
        </svg> 
   `;
}
exports.buildSvg = buildSvg;
function mapSvgGameBgMetadata(encodedMedia, dimensions) {
    return {
        "encodedMedia": encodedMedia,
        "positionX": dimensions.x,
        "positionY": dimensions.y,
        "width": dimensions.width,
        "height": dimensions.height,
    };
}
exports.mapSvgGameBgMetadata = mapSvgGameBgMetadata;
function truncateText(text, config) {
    if (!text)
        return '';
    return text.length > config.maxLength
        ? `${text.slice(0, config.truncateAt)}...`
        : text;
}
exports.truncateText = truncateText;
