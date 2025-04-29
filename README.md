# Andrew-Discord-Bot
 
The funny Andrew_Fish27 bot. For now, it's very top secret! :trollface:
![killmenow](https://github.com/user-attachments/assets/95a9fca0-9808-4fa6-9a2e-e70be941d36c)

This gives you nothing but the accurate experience with Andrew, anytime, anywhere! 

It's even got his Griffith, Kanye, Reagan, Mussolini AND even his Nick Fuentes obsession, what more could you ask for?!

------------------------------------------------------------------------------
## THE REAL SHIT AND ITS FEATURES
This bot was made as an inside-joke, and it could be pretty offensive, so there's that. It's also pretty funny, I'd say.

It features nonsensical messages that sent at random intervals, peak slash commands, image descriptions, and hell, it's even got a LLM!

And for even more entertainment; [he's even got a enemy that beefs with Andrew!](https://github.com/TheDragonary/Anti-Andrew-Discord-Bot) (Note: Bot isn't included with the main package. It's purely an optional, separate project.)

------------------------------------------------------------------------------
# REQUIREMENTS FOR THE FEW THAT NEED IT

## CLONING
First and foremost, you would have to clone the repo using:
```
git clone https://github.com/SpookedDoor/Andrew-Discord-Bot.git
```

Or you can just simply use Github Desktop, whatever floats your boat.

## THE MEAT ON THE BONES
Before using this bot, I'd recommend reading the [discord.js guide](https://discord.js.org/), if you haven't already. 

(... or you can simply install ``npm install discord.js openai axios dotenv`` in your terminal.)

But if you already have; then you WILL need to have an ``.env`` file and have it look like this:
```dotenv
DISCORD_TOKEN=YOURTOKENHERE
BRAVE_API_KEY=YOURKEYHERE
```
And a ``config.json`` that looks something like this. 
```json
{
    "token": "YOURTOKENHERE",
    "clientId": "YOURCLIENTID",
    "channelMap": {
        "YOURSERVERID": "YOURCHANNELID",
    }
}
```

Afterwards, you WILL have to use a local AI backend such as [KoboldCPP](https://github.com/LostRuins/koboldcpp). Though, it is possible to make it use Openrouter/OpenAI, but you'd have to manually set that up yourself, as we don't support it anymore. (The bot actually used to primarily use Openrouter before we switched to local AIs!)

If you have KoboldCPP installed and everything, make sure to set your ``baseURL`` to be the same as it is in ``./commands/utility/gpt.js``, ``./commands/utility/gptimage.js``, and ``searchTools.js``. By default it looks like:  
```dotenv js
	baseURL: "http://localhost:5001/v1",
	apiKey: "0"
```

Although it's already like this by default, make sure the model is set to:
```js
const model = 'koboldcpp';
```

### THE REST
Well, there you have it! The rest is pretty self-explanatory. You can look through the code and edit it and whatnot. 

But if you were to use it for other projects, I'd recommend you credit both me; SpookedDoor as well as Dragonary (especially him. Without him, the project would be pretty barebones.)

![blud](https://github.com/user-attachments/assets/98b63b14-01c4-41bc-956e-e5fcb5a00455)
