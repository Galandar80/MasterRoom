import urllib.request
import os

tada_url = "https://raw.githubusercontent.com/hintertupferbene/tabata/master/assets/sounds/fanfare.mp3"
tada_output = r"e:\Progetti\MasterRoom - Antigravity\public\assets\audio\tada_fanfare_a.mp3"
headers = {'User-Agent': 'Mozilla/5.0'}

print("Downloading Fanfara Tada...")
try:
    req = urllib.request.Request(tada_url, headers=headers)
    with urllib.request.urlopen(req) as response:
        mp3_data = response.read()
        
    with open(tada_output, 'wb') as f:
        f.write(mp3_data)
    print(f"Successfully saved Fanfara Tada: {tada_output} ({len(mp3_data)} bytes)")
except Exception as e:
    print(f"Failed: {e}")
