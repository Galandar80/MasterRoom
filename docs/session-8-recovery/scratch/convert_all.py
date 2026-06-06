import re
import urllib.request
import soundfile as sf
import os
import io
import numpy as np
import lameenc

source_file = r"e:\Progetti\MasterRoom - Antigravity\src\components\master-control-room.tsx"
output_dir = r"e:\Progetti\MasterRoom - Antigravity\public\assets\audio"

os.makedirs(output_dir, exist_ok=True)

# Parse URLs
with open(source_file, 'r', encoding='utf-8') as f:
    content = f.read()
    # Find anything like "https://actions.google.com/sounds/v1/...ogg"
    urls = re.findall(r'https://actions\.google\.com/sounds/v1/[a-zA-Z0-9_\-/]+\.ogg', content)

# Keep insertion order while removing duplicates
seen = set()
unique_urls = []
for u in urls:
    if u not in seen:
        seen.add(u)
        unique_urls.append(u)

print(f"Found {len(unique_urls)} unique OGG URLs to convert.")

headers = {'User-Agent': 'Mozilla/5.0'}

success_count = 0
failed_count = 0

for idx, url in enumerate(unique_urls, 1):
    filename = url.split('/')[-1]
    mp3_name = filename.replace('.ogg', '.mp3')
    output_path = os.path.join(output_dir, mp3_name)
    
    if os.path.exists(output_path):
        print(f"[{idx}/{len(unique_urls)}] Skipping {mp3_name}, already exists.")
        success_count += 1
        continue
        
    print(f"[{idx}/{len(unique_urls)}] Downloading {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            ogg_data = response.read()
            
        data, samplerate = sf.read(io.BytesIO(ogg_data))
        
        # Determine channels
        if len(data.shape) == 1:
            channels = 1
        else:
            channels = data.shape[1]

        # Convert to 16-bit PCM bytes
        pcm_data = np.clip(data * 32768, -32768, 32767).astype(np.int16)
        pcm_bytes = pcm_data.tobytes()

        # Encode to MP3
        encoder = lameenc.Encoder()
        encoder.set_bit_rate(128)
        encoder.set_in_sample_rate(samplerate)
        encoder.set_channels(channels)
        encoder.set_quality(2) # high quality
        
        mp3_data = encoder.encode(pcm_bytes)
        mp3_data += encoder.flush()

        with open(output_path, 'wb') as f_out:
            f_out.write(mp3_data)
            
        print(f"    --> Converted to {mp3_name} ({len(mp3_data)} bytes)")
        success_count += 1
    except Exception as e:
        print(f"    --> Failed: {e}")
        failed_count += 1

print(f"\nConversion finished. Success: {success_count}, Failed: {failed_count}")
