# daily

🤖 A collection of slack bots

## TOC

- [Getting Started](#getting-started)
  - [requirements](#requirements)
  - [server configuration](#server-configuration)
  - [slack app configuration](#slack-app-configuration)
- [Screenshots](#screenshots)
  - [dailylunch](#dailylunch)
  - [dailydrink](#dailydrink)
- [Author, License](#author-license)

## Getting Started

### requirements

- [firebase cloud firestore](https://firebase.google.com/products/firestore/): We use firebase since it's easier to setup and manage in the console. But really you can use any db service or even spawn up your own API gateway, all the APIs are in `app/store.js`, just replace it with whatever you got. Enable firestore in the console, but we don't need to setup any rules since we are all communicating server-to-server.
- [now.sh](https://now.sh): We use the version 1 of now.sh for now, but really you can bring whatever server you have, as long as it can run node.
- [slack app](https://api.slack.com/apps): Create your own app in your workspace. We are building slack bots, duhh.

There are some required environment variables need to be setup too.

| variable name         | description                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| FIREBASE_CREDENTIALS  | `base64` encoded firebase service account credentials json file                                    |
| SLACK_TOKEN           | slack app OAuth access token                                                                       |
| SIGNING_SECRET        | slack app signing secret                                                                           |
| DEV_SLACK_TOKEN       | development slack app OAuth access token                                                           |
| DEV_SIGNING_SECRET    | development slack app signing secret                                                               |
| CLOSE_USER_WHITE_LIST | users who are the admins and can close dailylunch orders, leave it an empty string if not required |

Neither `DEV_SLACK_TOKEN` and `DEV_SIGNING_SECRET` are required, but if you already have a production version of your app, it's considered a good idea to develop new features in a development version app. Just create two apps, one for production and one for development.

### server configuration

You can use any server service, but take [now.sh](https://now.sh) as an example.

```sh
yarn install
now secrets add FIREBASE_CREDENTIALS "..." # do it for all the env variables
yarn run deploy:prod
```

### slack app configuration

Assuming you have already deployed your server, and the root url of it is `https://YOUR_APP.now.sh`.

1. Enable `Interactive Components` and enter the following urls respectively:
   - Interactivity Request URL: `https://YOUR_APP.now.sh/slack/interactive`
   - Message Menus options load url: `https://YOUR_APP.now.sh/slack/options`
2. Add the following slash commands under `Slash Commands`, naming are opinionated:
   - `/dailylunch`: `https://YOUR_APP.now.sh/slack/slash/dailylunch`
   - `/dailydrink`: `https://YOUR_APP.now.sh/slack/slash/dailydrink`
3. Add the following scopes under `Auth & Permissions`:
   - `chat:write:bot`
   - `chat:write:user`
   - `commands`: it should be added automatically when you are setting up slash commands
4. All set! Hit `Install App` and try the commands in your slack workspace.

## Screenshots

### dailylunch

A lunch ordering service bot.

<img src="assets/dailylunch-screenshot.png" height="350" alt="dailylunch">

### dailydrink

A drink ordering service bot.

<img src="assets/dailydrink-screenshot.png" height="500" alt="dailydrink">

## Author, License

Kai Hao,

MIT
