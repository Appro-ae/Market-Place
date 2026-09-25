from PIL import Image
src = Image.open('../SC2_Rule_Engine_Values_Current.png').convert('RGB')
im = src.copy()
# The value input's caret + "Select value" + magnifier glyph, lifted pixel-exact
# and re-seated 20px right, because the wider "AECB Score Segment" chip pushes
# the input across. Same pixels, new position - nothing is redrawn.
R = src.crop((312, 318, 436, 350))
im.paste((255, 255, 255), (312, 318, 456, 350))
im.paste(R, (332, 318))
im.save('base_sc6.png')
print('base_sc6.png', im.size)
