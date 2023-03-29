<p align="center">
  <h2 align="center">Github Readme Steam Status</h2>
  <p align="center">:video_game: A dynamically generated steam status for your github readme inspired by github readme stats</p>
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

use your steamid64 as the value for ```?steamid=``` (you may use [steam id finder](https://www.steamidfinder.com/)), you may adjust the width and height of the card through the markdown (Default card res: ```800x300```)

```md
<img src="https://github-readme-steam-status.vercel.app/?steamid=<SteamID64 here>" alt="" width="450px" height="150px" />
```

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198569064-1a0d0b74-ce85-4234-9cae-9a2092f3e1da.png" alt="" width="450px" height="150px" />
</p>

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198578892-dc1500e8-3cee-4ddf-a26a-ce2373025d0d.png" alt="" width="450px" height="150px" />
</p>

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198579269-c953e88f-09ce-4dca-bf26-28d83ccb0d3c.png" alt="" width="450px" height="150px" />
</p>

## Available Options

-   `current_game_bg` - Use current game banner as a partial background for the card else use steam logo. Default: `true`.
-   `last_played_bg` - Same description as above except its for the last game you played and when you are not in-game. Default: `true`.

```md
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&current_game_bg=false
```

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198583571-6feca268-525a-4944-929e-c6dc840a2f6e.png" alt="" width="450px" height="150px" />
</p>

```md
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&current_game_bg=true
```

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198583554-586b31c4-4d12-42a8-8380-774bf4cb32a2.png" alt="" width="450px" height="150px" />
</p>

```md
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&last_played_bg=false
```

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198580533-05e4d791-96ca-4f4e-9589-213e9130de94.png" alt="" width="450px" height="150px" />
</p>

```md
https://github-readme-steam-status.vercel.app/?steamid=<SteamID64here>&last_played_bg=true
```

<p align="center">
  <img align="center" src="https://user-images.githubusercontent.com/88238718/198580199-4758f2a2-38bc-436b-9265-aaf3010ad998.png" alt="" width="450px" height="150px" />
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

### To do
- More styling/theme (soon)
- TBD

## :sparkling_heart: Support the project

I'm devotee of open-source. Everything is free with all the effort and time I gave for this and other projects. However there are some ways you can show your support:

- Starring or sharing this project
- Pr's are welcome and highly appreciated if you think you can make this project better :)
