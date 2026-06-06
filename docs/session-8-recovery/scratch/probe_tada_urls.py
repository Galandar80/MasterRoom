import urllib.request

urls = [
    "https://raw.githubusercontent.com/10-projects-1-hour/sound-board/master/sounds/tada.mp3",
    "https://raw.githubusercontent.com/10-projects-1-hour/sound-board/main/sounds/tada.mp3",
    "https://raw.githubusercontent.com/10-projects-1-hour/sound-board/master/sound-board/sounds/tada.mp3",
    "https://raw.githubusercontent.com/10-projects-1-hour/sound-board/main/sound-board/sounds/tada.mp3",
    "https://raw.githubusercontent.com/bradtraversy/50projects50days/master/09-sound-board/sounds/tada.mp3",
    "https://raw.githubusercontent.com/bradtraversy/50projects50days/main/09-sound-board/sounds/tada.mp3",
    "https://raw.githubusercontent.com/bradtraversy/50projects50days/master/sound-board/sounds/tada.mp3",
    "https://raw.githubusercontent.com/bradtraversy/50projects50days/main/sound-board/sounds/tada.mp3",
    "https://raw.githubusercontent.com/hintertupferbene/tabata/master/assets/sounds/fanfare.mp3",
    "https://raw.githubusercontent.com/hintertupferbene/tabata/main/assets/sounds/fanfare.mp3",
]

headers = {'User-Agent': 'Mozilla/5.0'}

for url in urls:
    req = urllib.request.Request(url, headers=headers, method='HEAD')
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"[FOUND] {url}")
    except Exception as e:
        pass
