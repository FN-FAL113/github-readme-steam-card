<p align="center">
  <h1 align="center">Github Readme Steam Status</h1>
  <p align="center">:video_game: A dynamically generated steam status for your github readme inspired by github readme stats</p>
  <p align="center">Animated avatar frames are supported!</p>
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

## Usage

Add the following markdown to your github readme

use your steamid64 as the value for ```?steamid=``` (you may use [steam id finder](https://www.steamidfinder.com/)), you may adjust the width and height of the card through markdown.

```md
<img src="https://github-readme-steam-status.vercel.app/?steamid=<SteamID64 here>" alt="" width="500px" height="200px" />
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/e362b289-11c2-444f-8546-4f99aa621535" alt="" width="500px" height="200px" />
</p>

## Available Options

-   `current_game_bg` - Use current game banner as a partial background for the card else use steam logo. Default: `true`.
-   `last_played_bg` - Same description as above except its for the last game you played and when you are not in-game. Default: `true`.

```md
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&current_game_bg=false
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/687e6f4f-0228-461a-9e62-bf032373b373" alt="" width="500px" height="200px" />
</p>

```md
Default if current game bg option is not stated
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&current_game_bg=true
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/210c475e-1b3f-4b25-8419-0de192908171" alt="" width="500px" height="200px" />
</p>

```md
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&last_played_bg=false
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/eb64d409-5475-4428-aebe-8828a5e3131c" alt="" width="500px" height="200px" />
</p>

```md
Default if last game bg option is not stated
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&last_played_bg=true
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/5a3bc100-3e9a-47d3-9752-95c1c93246ca" alt="" width="500px" height="200px" />
</p>

You may combine these options together
```md
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&current_game_bg=true&last_played_bg=true
```

## Deploy your own Vercel instance

Create an account on vercel if you don't have yet

Generate your steam api key by going to [Steam Web API Docs](https://steamcommunity.com/dev) and supply the environment variable ```STEAM_API_KEY``` with your own

You may fork this project and deploy it to vercel or click the deploy button below which does most of the stuffs for you

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFN-FAL113%2Fgithub-readme-steam-status&env=STEAM_API_KEY)

### Disclaimer
This project or its author are not affiliated, associated, authorized, endorsed by steam, its affiliates or subsidiaries. Images, names and other form of trademark are registered to their respective owners.

## :sparkling_heart: Support the project

I'm devotee of open-source. Everything is free with all the effort and time I gave for this and other projects. However there are some ways you can show your support:

- Starring or sharing this project
- Pr's are welcome and highly appreciated if you think you can make this project better :)
