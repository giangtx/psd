from psd_tools import PSDImage
from PIL import Image
from psd_tools.constants import ChannelID

psd = PSDImage.open('./temp_template-cmyk.psd')
for index, layer in enumerate(psd):
    image = layer.topil()
    alpha_channel = layer.topil(ChannelID.TRANSPARENCY_MASK) if image.mode == "CMYK" else None
    image = image.convert("RGBA")
    if alpha_channel:
        r, g, b, a = image.split()
        image = Image.merge("RGBA", [r, g, b, alpha_channel])
    image.save('./cmyks/%s.png' % layer.name)