from PIL import Image, ImageChops

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

def process_logo(path):
    try:
        im = Image.open(path)
        # Convert to RGBA to handle transparency if any, or RGB
        if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
            bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
            bg.paste(im, (0, 0), im.convert('RGBA'))
            im = bg.convert('RGB')
        else:
            im = im.convert('RGB')

        trimmed = trim(im)
        
        # Add a small padding (e.g., 5%)
        width, height = trimmed.size
        pad_x = int(width * 0.05)
        pad_y = int(height * 0.05)
        
        new_im = Image.new('RGB', (width + 2*pad_x, height + 2*pad_y), (255, 255, 255))
        new_im.paste(trimmed, (pad_x, pad_y))
        
        new_im.save(path)
        print(f"Processed {path}")
    except Exception as e:
        print(f"Error processing {path}: {e}")

process_logo("/Users/archilundilashvili/Desktop/allrates.ge/Logos/leader.jpg")
process_logo("/Users/archilundilashvili/Desktop/allrates.ge/Logos/Inex.png")

