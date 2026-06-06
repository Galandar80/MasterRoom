import urllib.request
import soundfile as sf
import os
import io

url = "https://actions.google.com/sounds/v1/doors/creaking_wooden_door.ogg"
output_dir = r"e:\Progetti\MasterRoom - Antigravity\public\assets\audio"
output_path = os.path.join(output_dir, "creaking_wooden_door.wav")

print("Downloading ogg file...")
try:
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        ogg_data = response.read()
    print(f"Downloaded {len(ogg_data)} bytes.")

    # Read from byte buffer using soundfile
    data, samplerate = sf.read(io.BytesIO(ogg_data))
    print(f"Read audio: shape={data.shape}, rate={samplerate}")

    # Write to wav
    sf.write(output_path, data, samplerate)
    print(f"Successfully wrote WAV to {output_path}")
    print(f"File size: {os.path.getsize(output_path)} bytes.")
except Exception as e:
    print(f"Error: {e}")
