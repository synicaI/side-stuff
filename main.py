import discord
from discord.ext import commands
from flask import Flask, request, jsonify
import threading
import os

# 1. API Setup (For Roblox)
app = Flask(__name__)
VALID_KEY = "1933"
SECRET = "your_actual_secret"
whitelisted_hwids = [] # In a real app, use a Database!

@app.route('/')
def check_auth():
    key = request.args.get('key')
    hwid = request.args.get('hwid')
    secret = request.args.get('secret')

    if key == VALID_KEY and secret == SECRET:
        # Check if hwid is in your database
        if hwid in whitelisted_hwids:
            return "Authenticated", 200
        return "Not Whitelisted", 403
    return "Invalid Credentials", 401

def run_flask():
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))

# 2. Discord Bot Setup
intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.command()
async def whitelist(ctx, hwid_to_add: str):
    whitelisted_hwids.append(hwid_to_add)
    await ctx.send(f"✅ Added {hwid_to_add} to the whitelist!")

# 3. Start both at once
if __name__ == "__main__":
    # Run Flask in a background thread so the Bot can run too
    threading.Thread(target=run_flask).start()
    bot.run(os.environ.get("DISCORD_TOKEN"))
