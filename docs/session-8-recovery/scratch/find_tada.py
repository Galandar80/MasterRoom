import urllib.request

categories = [
    "alarms", "cartoon", "emergency", "foley", "doors", "impacts", 
    "weapons", "animals", "science_fiction", "horror", "weather", 
    "crowds", "transportation", "office", "music", "human", "sports"
]

headers = {'User-Agent': 'Mozilla/5.0'}

for cat in categories:
    url = f"https://actions.google.com/sounds/v1/{cat}/tada_fanfare_a.ogg"
    req = urllib.request.Request(url, headers=headers, method='HEAD')
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"[FOUND] {url}")
    except Exception as e:
        pass
