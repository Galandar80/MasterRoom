import urllib.request

urls = [
    "https://actions.google.com/sounds/v1/weather/wind_howl.ogg",
    "https://actions.google.com/sounds/v1/weather/howling_wind.ogg",
    "https://actions.google.com/sounds/v1/weather/wind_blowing.ogg",
    "https://actions.google.com/sounds/v1/weather/storm_wind.ogg",
    "https://actions.google.com/sounds/v1/weather/gusty_wind.ogg",
    "https://actions.google.com/sounds/v1/weather/heavy_wind.ogg",
    "https://actions.google.com/sounds/v1/weather/wind_howl_loop.ogg",
    "https://actions.google.com/sounds/v1/weather/strong_wind.ogg",
    "https://actions.google.com/sounds/v1/weather/gale_force_wind.ogg",
    "https://actions.google.com/sounds/v1/weather/wind.ogg",
    "https://actions.google.com/sounds/v1/cartoon/tada.ogg",
    "https://actions.google.com/sounds/v1/cartoon/tada_fanfare.ogg",
    "https://actions.google.com/sounds/v1/cartoon/fanfare.ogg",
    "https://actions.google.com/sounds/v1/alarms/tada.ogg",
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
