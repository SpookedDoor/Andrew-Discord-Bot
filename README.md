# Andrew-Discord-Bot
 
The funny Andrew_Fish27 bot. For now, it's very top secret! :trollface:
![killmenow](https://github.com/user-attachments/assets/95a9fca0-9808-4fa6-9a2e-e70be941d36c)

This gives you nothing but the accurate experience with Andrew, anytime, anywhere! 

It's even got his Griffith, Kanye, Reagan, Mussolini AND even his Nick Fuentes obsession, what more could you ask for?!

------------------------------------------------------------------------------
## THE REAL SHIT AND ITS FEATURES
This bot was made as an inside-joke, and it could be pretty offensive, so there's that. It's also pretty funny, I'd say. 

(Of course, we don't agree with the stuff he says. This is purely satire.)

It features over 200 (and counting!) nonsensical messages that sent at random intervals, as well as peak slash commands, image descriptions, and hell, it's even got a LLM!

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

(...or you can simply install ``npm install discord.js openai axios dotenv node-fetch`` in your terminal. But it's still recommended to read the guide to at least understand some of the basic stuff.)

But if you already have; then you WILL need to have a ``.env`` file and have it look like this:
```dotenv
DISCORD_TOKEN=YOURTOKENHERE
BRAVE_API_KEY=YOURKEYHERE
GOOGLE_API_KEY=YOURKEYHERE
GOOGLE_CSE_ID=YOURIDHERE
GEMINI_API_KEY=YOURIDHERE
```

The bot uses Brave for normal web searches and Google for its image searches, if you don't want to use Google, then you'll have to edit ``gpt.js``, ``gptimage.js`` and ``messageCreate.js`` and change all instances of ``googleImageSearch`` to ``braveImageSearch``. If you don't want the bot to have web search capabilities, then you gotta delete the files related to that and also remove the associated code in those files. That would probably be a bit more of a hassle than just creating a Brave Search API account. The AI will still work without an API key provided for web searches, but you will see errors in the console, and the bot will be a bit dumber I suppose.

If you are planning to use online AI services instead of KoboldCPP, you would of course need to put your API key in there. A ``template.env`` is provided which shows you how it's set up and all you really gotta do is add in your own token and API keys. OBVIOUSLY, remove ``template`` from ``template.env``.

You will also need a ``config.json`` that looks something like this. A template is also provided, guess what you must do with that too.
```json
{
    "token": "YOURTOKENHERE",
    "clientId": "YOURCLIENTID",
    "channelMap": {
        "YOURSERVERID": "YOURCHANNELID",
    }
}
```

Unsurprisingly, you MUST also remove ``template`` from ``userIdentities.template.js`` (otherwise you will get errors) and then you can add your own users to it if you want.

Speaking of which... we now added ``aiSettings.js`` which makes it a lot easier to work with other AI services and switch models quickly!

I recommend using local AIs as there are practically no costs or limits (other than your GPU of course) but if you decide to go with an online AI service, I would highly recommend [Google Gemini](https://aistudio.google.com) as rate limits for free users are pretty decent for now. Openrouter is also free to use but it does have its limits, and OpenAI is by far the worst and most expensive option.

Also, 🖕 Chutes for being no longer free.

Currently, the bot is now using Gemini by default. Obviously, you may prefer to use a local AI (if you have the power to do so) and that is all detailed below. If you prefer a different service, you can figure everything out yourself just by looking at ``aiSettings.js``.

## RUNNING WITH LOCAL AI
Install a local AI backend such as [KoboldCPP](https://github.com/LostRuins/koboldcpp). Follow KoboldCPP's guide on getting everything set up. The most important part is obtaining an [AI model](https://huggingface.co/models?library=gguf&sort=trending). Make sure that you download a GGUF file and at least something that your PC can handle with ease (that means you can't just simply download Deepseek. If you want to use that, please use a service that provides it, like Chutes).

For vision to work locally, download the correct [mmproj](https://huggingface.co/koboldcpp/mmproj/tree/main). For example, if you are using a model based on Llama3, download the one that says Llama3, then you would insert it into Loaded Files > Vision mmproj.

Once that is installed and running, make sure to set your ``baseURL`` in ``aiSettings.js``. It should look like:  
```js
	baseURL: "http://localhost:5001/v1",
	apiKey: "0"
```
And make sure all model variables in ``aiSettings.js`` are set to ``"koboldcpp"``.

Simple!

### THE REST
Well, there you have it! The rest is pretty self-explanatory. You can look through the code and edit it and whatnot. 

But if you were to use it for other projects, I'd recommend you credit both me; SpookedDoor as well as Dragonary (especially him. Without him, the project would be pretty barebones.)

For even more help, refer to the [wiki page](https://github.com/SpookedDoor/Andrew-Discord-Bot/wiki).

![blud](https://github.com/user-attachments/assets/98b63b14-01c4-41bc-956e-e5fcb5a00455)