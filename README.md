<p align="center">
  <h2 align="center">Github Readme Steam Status</h2>
  <p align="center">:video_game: A dynamically generated steam status for your github readme</p>
</p>
</p>
<p align="center">
  <a href="https://github.com/FN-FAL113/github-readme-steam-status/issues">
    <img src="https://img.shields.io/github/issues/FN-FAL113/github-readme-steam-status"/> 
  </a>
  <a href="https://github.com/FN-FAL113/github-readme-steam-status/pulls">
    <img src="https://img.shields.io/github/issues-pr/FN-FAL113/github-readme-steam-status"/> 
  </a>
  <a href="https://github.com/FN-FAL113/github-readme-steam-status/network/members">
    <img src="https://img.shields.io/github/forks/FN-FAL113/github-readme-steam-status"/> 
  </a>  
  <a href="https://github.com/FN-FAL113/github-readme-steam-status/stargazers">
    <img src="https://img.shields.io/github/stars/FN-FAL113/github-readme-steam-status"/> 
  </a>
  <a href="https://github.com/FN-FAL113/github-readme-steam-status/LICENSE">
    <img src="https://img.shields.io/github/license/FN-FAL113/github-readme-steam-status"/> 
  </a> 
</p>

# Steam Status Card

Add the following markdown to your github readme

use your steamid64 as the value for ```?steamid=``` (you may use [steam id finder](https://www.steamidfinder.com/)), you may adjust the width and height of the card if you prefer (default card res: 800x300)

```md
<p align="center">
  <img align="center" src="https://github-readme-steam-status.vercel.app/?steamid=<SteamID64 here>" alt="" width="450px" height="150px" />
</p>
```

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198570658-015b70c2-ac8c-4750-aa00-93699d9a4fba.png" alt="" width="450px" height="150px" />
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198569064-1a0d0b74-ce85-4234-9cae-9a2092f3e1da.png" alt="" width="450px" height="150px" />
</p>

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198571655-fff4b6f5-780e-4f37-b905-3b67a6a022b7.png" alt="" width="450px" height="150px" />
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198571646-9b004251-351c-4211-84fd-faee22b9770c.png" alt="" width="450px" height="150px" />
</p>

## Available Options

-   `current_game_bg` - Use current game banner as a partial background for the card else use steam logo. Default: `true`.
-   `last_played_bg` - Same description as above except its for the last game you played and when you are not in-game. Default: `true`.

## Deploy your own Vercel instance

Make sure to set project node version to 14.x in ```Project Settings > General > Node.Js Version```

Generate your steam api key by going to [Steam Web API Docs](https://steamcommunity.com/dev) and supply the environment variable ```STEAM_API_KEY``` with your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFN-FAL113%2Fgithub-readme-steam-status&env=STEAM_API_KEY)

## :sparkling_heart: Support the project

I'm devotee of open-source. Everything is free with all the effort and time I gave for this and other projects. However there are some ways you can show your support:

- Giving a proper credit by linking back this repo in your projects or github readme
- Starring or sharing this project
- I'm a college student with no source of income and no paypal yet, any of the following ways means a lot to me
