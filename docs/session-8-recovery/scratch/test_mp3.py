import urllib.request
import soundfile as sf
import os
import io
import numpy as np
import lameenc

url = "https://actions.google.com/sounds/v1/doors/creaking_wooden_door.ogg"
output_dir = r"e:\Progetti\MasterRoom - Antigravity\public\assets\audio"
output_path = os.path.join(output_dir, "creaking_wooden_door.mp3")

print("Downloading ogg file...")
try:
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        ogg_data = response.read()
    print(f"Downloaded {len(ogg_data)} bytes.")

    # Read audio data
    data, samplerate = sf.read(io.BytesIO(ogg_data))
    print(f"Read audio: shape={data.shape}, rate={samplerate}")

    # Determine channels
    if len(data.shape) == 1:
        channels = 1
    else:
        channels = data.shape[1]

    # Convert to 16-bit PCM bytes
    # Ensure clipping is handled
    pcm_data = np.clip(data * 32768, -32768, 32767).astype(np.int16)
    pcm_bytes = pcm_data.tobytes()

    # Encode to MP3
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(128)
    encoder.set_in_sample_rate(samplerate)
    encoder.set_channels(channels)
    encoder.set_quality(2) # high quality
    
    print("Encoding to MP3...")
    mp3_data = encoder.encode(pcm_bytes)
    mp3_data += encoder.flush()

    with open(output_path, 'wb') as f:
        f.write(mp3_data)
        
    print(f"Successfully wrote MP3 to {output_path}")
    print(f"File size: {os.path.getsize(output_path)} bytes.")
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
