<p align="center">
  <h1 align="center">Github Readme Steam Card</h1>
  <p align="center">:video_game: A dynamically generated steam card for your github readme</p>
  <p align="center">Animated avatar or frames supported!</p>
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
    <img src="https://github-readme-steam-card.vercel.app/status/?steamid=76561198085145110"/>
    <img src="https://github-readme-steam-card.vercel.app/status/?steamid=76561198085145110&animated_avatar=true"/>
</p>

## Usage

Add the following markdown to your github readme

use your steamid64 as the value for ```?steamid=``` (you may use [steam id finder](https://www.steamidfinder.com/)).

display through markup
```html
<img src="https://github-readme-steam-card.vercel.app/status/?steamid=<SteamID64 here>"/>
```
or through markdown
```md
![GRSS](https://github-readme-steam-card.vercel.app/status/?steamid=<SteamID64 here>)
```

## Available Options

-   `show_in_game_bg` - display in game banner as a partial background, fallback to steam logo if set to false.
-   `show_recent_game_bg` - display recent game banner as partial background, fallback to steam logo if set to false.

```md
https://github-readme-steam-card.vercel.app/status/?steamid=<SteamID64here>&show_in_game_bg=false
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/5dd9d19a-574f-4e44-a9e3-cb1a18984dc3"/>
</p>

```md
Default
https://github-readme-steam-card.vercel.app/status/?steamid=<SteamID64here>&show_in_game_bg=true
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/8aac2658-2168-498e-a205-dd3b72b115a8"/>
</p>

```md
https://github-readme-steam-card.vercel.app/status/?steamid=<SteamID64here>&show_recent_game_bg=false
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/060050ff-d898-426f-8a2b-10cb454a3ea5"/>
</p>

```md
Default
https://github-readme-steam-card.vercel.app/status/?steamid=<SteamID64here>&show_recent_game_bg=true
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/535aba84-c82d-4200-9f1d-dabefffee2c2"/>
</p>

```md
Default: false (animated avatar only due to payload limit with serverless platforms)
https://github-readme-steam-card.vercel.app/status/?steamid=<SteamID64here>&show_recent_game_bg=true  
```

<p align="center">
  <img align="center" src="https://github.com/FN-FAL113/github-readme-steam-status/assets/88238718/eb6dbbc1-5362-40d2-a095-09a79f873e99"/>
</p>

You may combine these options together
```md
https://github-readme-steam-card.vercel.app/status/?steamid=<SteamID64here>&show_in_game_bg=true&show_recent_game_bg=false
```

## Deploy your own Vercel instance

Generate your steam api key by going to [Steam Web API Docs](https://steamcommunity.com/dev) and supply the environment variable ```STEAM_API_KEY``` with your own.

**Fork** this project and deploy it to your own vercel instance or click the deploy button below which does most of the stuffs for you.

Create an account on vercel if you don't have yet.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFN-FAL113%2Fgithub-readme-steam-status&env=STEAM_API_KEY)

### FAQ
1. **Enable animated avatar and frame at the same time**
- Despite previously adding support even with proper image optimizations, the api is hitting a timeout against github's cdn proxy. This is due to the imposed time window by github for rendering images inside readme files which would be ~4s. After tireless testing, I had to further optimize and trim down the app in order to lessen api execution time. The dillemmas associated with enabling both animated avatar and frames:
  1. animated avatars without image optimization reaches payload limit for functions.
  2. animated avatars with image optimization increases execution time and function size due to additional package causing timeouts.
  3. serverless payload limit is capped at 5mb, animated avatar and frames enabled altogether can have a payload size of over 5-7mb.

2. **Cold Boot and Github CDN timeouts**
- Cold boots may cause image loading or rendering timeouts through github's cdn proxy which has a time limit on serving content from the origin. Subsequent requests might return a stale response while revalidating the cache to serve the most recent content.

3. **Recently played game not showing**
- To be able to use this feature, an <a href="#deploy-your-own-vercel-instance">instance<a/> of the project through vercel with your steam api key must be created to access user recently played games. 

### Disclaimer
This project or its author are not affiliated, associated, authorized, endorsed by steam, its affiliates or subsidiaries. Images, names and other form of trademark are registered to their respective owners.

## :sparkling_heart: Support the project/dev

Open-sourcing projects are great with all the effort and time I dedicate. However there are some ways you can show your support to me:

- Giving a star or sharing this project to gamer devs out there.
- Through pull requests, if you think you can make essential changes.
- Donations are welcome but not required appreciated:
<br/>
<a href="https://www.paypal.com/paypalme/fnfal113" target=_blank>
  <img src="https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png" alt="Donate with PayPal" width="32%" />
</a>
