<p align="center">
  <h1 align="center">Github Readme Steam Status</h1>
  <p align="center">:video_game: A dynamically generated steam status for your github readme</p>
  <p align="center">Animated avatar frames supported!</p>
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

<p align="center">
    <img src="https://github-readme-steam-status.vercel.app/status/?steamid=76561198085145110"/>
    <img src="https://github-readme-steam-status.vercel.app/status/?steamid=76561198038294255"/>
</p>

## Usage

Add the following markdown to your github readme

use your steamid64 as the value for ```?steamid=``` (you may use [steam id finder](https://www.steamidfinder.com/)).

display through markup
```html
<img src="https://github-readme-steam-status.vercel.app/status/?steamid=<SteamID64 here>"/>
```
or through markdown
```md
![GRSS](https://github-readme-steam-status.vercel.app/status/?steamid=<SteamID64 here>)
```

## Available Options

-   `show_in_game_bg` - display in game banner as a partial background, fallback to steam logo if set to false.
-   `show_recent_game_bg` - display recent game banner as partial background, fallback to steam logo if set to false.

```md
https://github-readme-steam-status.vercel.app/status/?steamid=<SteamID64here>&show_in_game_bg=false
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/687e6f4f-0228-461a-9e62-bf032373b373"/>
</p>

```md
Defaults to true if not explicitly set
https://github-readme-steam-status.vercel.app/status/?steamid=<SteamID64here>&show_in_game_bg=true
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/210c475e-1b3f-4b25-8419-0de192908171"/>
</p>

```md
https://github-readme-steam-status.vercel.app/status/?steamid=<SteamID64here>&show_recent_game_bg=false
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/eb64d409-5475-4428-aebe-8828a5e3131c"/>
</p>

```md
Defaults to true if not explicitly set
https://github-readme-steam-status.vercel.app/status/?steamid=<SteamID64here>&show_recent_game_bg=true
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/5a3bc100-3e9a-47d3-9752-95c1c93246ca"/>
</p>

You may combine these options together
```md
https://github-readme-steam-status.vercel.app/status/?steamid=<SteamID64here>&show_in_game_bg=true&show_recent_game_bg=false
```

## Deploy your own Vercel instance

Create an account on vercel if you don't have yet

Generate your steam api key by going to [Steam Web API Docs](https://steamcommunity.com/dev) and supply the environment variable ```STEAM_API_KEY``` with your own

You may fork this project and deploy it to vercel or click the deploy button below which does most of the stuffs for you

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFN-FAL113%2Fgithub-readme-steam-status&env=STEAM_API_KEY)

### FAQ
1. **Animated avatar support when....**
- Despite previously adding support even with proper image optimizations, the api is hitting a timeout against github's cdn proxy. This is due to the imposed time window by github for rendering images inside readme files which would be ~4s. After tireless testing, I had to further optimize and trim down the app in order to lessen api execution time that is also being affected by Cold Boots with the cost of not supporting animated avatars. The dillemmas associated with adding animated avatar:
  1. Adding animated avatars without image optimization reaches payload limit for functions.
  2. Adding animated avatars with image optimization increases execution time and function size due to additional package causing timeouts.

2. **Cold Boot and Github CDN timeouts**
- Cold boots may cause image loading or rendering timeouts through github's cdn proxy which has a time limit on serving content from the origin. Subsequent requests might return a stale response while revalidating the cache to serve the most recent content. 

### Disclaimer
This project or its author are not affiliated, associated, authorized, endorsed by steam, its affiliates or subsidiaries. Images, names and other form of trademark are registered to their respective owners.

## :sparkling_heart: Support the project/dev

Open-sourcing projects are great with all the effort and time I gave without asking for donations. However there are some ways you can show your support to me:

- Giving a star or sharing this project to gamer devs out there
- Pr's are welcome and highly appreciated if you think you can make this project better :)
