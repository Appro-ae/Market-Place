"""Re-seat the value input 20px right, because the wider "AECB Score Segment"
chip pushes it across in the real layout. The pixels are moved, not redrawn."""
from PIL import Image
src = Image.open('SC2_clean.png').convert('RGB')
im = src.copy()
R = src.crop((312, 318, 436, 350))
im.paste((255, 255, 255), (312, 318, 456, 350))
im.paste(R, (332, 318))
im.save('base_sc6.png')
print('base_sc6.png', im.size)
