# Jalapeño Seed Arcade
Seven browser games with one cabinet selector. Open https://jalapenoseed.github.io/jalapeno-arcade/ or serve this directory with a static HTTP server.

## Games
Goldwing: Pollen Run is a solo spring flight game with touch controls and four camera views. [Play Goldwing](https://jalapenoseed.github.io/jalapeno-arcade/games/goldwing/).

Drifter’s Quest 2.5D uses its existing shared-world server. Penny Pusher Wars uses its existing authoritative duel server, with a local CPU mode. The cabinet opens the live Penny Pusher origin so online rooms pass the server?s origin check. A standalone client build under games/penny-pusher comes from revision 626dc286c274db57404ef788538e462779c907df of the Penny Pusher Wars repository.

BŌSŌ ’86, Backfire, ZERO//DAY ’95 and Last Cell Standing can be played solo or shared with one guest. Open a game, choose **Invite a friend**, then **Copy invite**. The host can pass keyboard controls and take them back. The guest receives the host’s game canvas without audio. Progress stays in the host’s browser. A modern desktop browser with WebRTC and a keyboard is recommended. Both players must keep their tabs open. Direct connections depend on network conditions.

## Hosting
GitHub Pages serves the root of main. Each games directory contains a playable browser distribution. The launcher loads one cabinet at a time. Cabinet artwork was captured from these builds. Shared cabinets use PeerJS 1.5.5 and the PeerJS public signaling service. The room link grants access to the live cabinet while the host has it open.
