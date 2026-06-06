import urllib.request
import soundfile as sf
import os
import io
import numpy as np
import lameenc

output_dir = r"e:\Progetti\MasterRoom - Antigravity\public\assets\audio"
headers = {'User-Agent': 'Mozilla/5.0'}

# 1. Download and convert strong_wind.ogg to wind_howling.mp3
wind_url = "https://actions.google.com/sounds/v1/weather/strong_wind.ogg"
wind_output = os.path.join(output_dir, "wind_howling.mp3")

print("Processing Vento Tempesta (strong_wind.ogg -> wind_howling.mp3)...")
try:
    req = urllib.request.Request(wind_url, headers=headers)
    with urllib.request.urlopen(req) as response:
        ogg_data = response.read()
    
    data, samplerate = sf.read(io.BytesIO(ogg_data))
    if len(data.shape) == 1:
        channels = 1
    else:
        channels = data.shape[1]

    pcm_data = np.clip(data * 32768, -32768, 32767).astype(np.int16)
    pcm_bytes = pcm_data.tobytes()

    encoder = lameenc.Encoder()
    encoder.set_bit_rate(128)
    encoder.set_in_sample_rate(samplerate)
    encoder.set_channels(channels)
    encoder.set_quality(2)
    
    mp3_data = encoder.encode(pcm_bytes)
    mp3_data += encoder.flush()

    with open(wind_output, 'wb') as f:
        f.write(mp3_data)
    print(f"Successfully saved Vento Tempesta: {wind_output} ({len(mp3_data)} bytes)")
except Exception as e:
    print(f"Failed to process Vento Tempesta: {e}")

# 2. Download and save tada.mp3 to tada_fanfare_a.mp3
tada_url = "https://raw.githubusercontent.com/10-projects-1-hour/sound-board/main/sound-board/sounds/tada.mp3"
tada_output = os.path.join(output_dir, "tada_fanfare_a.mp3")

print("Processing Fanfara Tada (tada.mp3 -> tada_fanfare_a.mp3)...")
try:
    req = urllib.request.Request(tada_url, headers=headers)
    with urllib.request.urlopen(req) as response:
        mp3_data = response.read()
        
    with open(tada_output, 'wb') as f:
        f.write(mp3_data)
    print(f"Successfully saved Fanfara Tada: {tada_output} ({len(mp3_data)} bytes)")
except Exception as e:
    print(f"Failed to process Fanfara Tada: {e}")
