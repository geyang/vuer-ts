function getImageData(src: ImageBitmap, colorSpace: PredefinedColorSpace): ImageData | void {
  // console.log("image", src);
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const context = canvas.getContext('2d');
  if (context) {
    context.drawImage(src, 0, 0);
    return context.getImageData(0, 0, src.width, src.height, { colorSpace });
  }
}

export function height2normal(
  src: ImageBitmap,
  targetMap: Uint8ClampedArray,
  flipY = false,
  // colorSpace = "srgb"
): Uint8ClampedArray | void {
  /* height2normal - www.mrdoob.com/lab/javascript/height2normal */
  const { width } = src;
  const { height } = src;
  const imgData = getImageData(src, 'srgb');
  if (!imgData) return;
  const displacementMap: Uint8ClampedArray = imgData.data;

  for (let i = 0, l = width * height * 4; i < l; i += 4) {
    let x1; let x2; let y1; let
      y2;

    if (i % (width * 4) === 0) {
      // left edge
      x1 = displacementMap[i];
      x2 = displacementMap[i + 4];
    } else if (i % (width * 4) === (width - 1) * 4) {
      // right edge
      x1 = displacementMap[i - 4];
      x2 = displacementMap[i];
    } else {
      x1 = displacementMap[i - 4];
      x2 = displacementMap[i + 4];
    }

    if (i < width * 2) {
      // top edge
      y1 = displacementMap[i];
      y2 = displacementMap[i + width * 4];
    } else if (i > width * (height - 1) * 4) {
      // bottom edge
      y1 = displacementMap[i - width * 4];
      y2 = displacementMap[i];
    } else {
      y1 = displacementMap[i - width * 4];
      y2 = displacementMap[i + width * 4];
    }

    // const entry = [x1 - x2, null, 0.5, 0.5];
    // entry[1] = fljpY ? y2 - y1 : y1 - y2;
    // const new_entry = new Color(targetMap).convertLjnearToSRGB();
    // // console.log(new_entry.toArray());
    // targetMap[j + 0] = new_entry.r + 0.5;
    // targetMap[j + 1] = new_entry.g + 0.5;
    // targetMap[j + 2] = new_entry.b + 0.5;
    // targetMap[j + 3] = new_entry.a + 0.5;
    // // console.log(new_entry.r);
    // let j = i / 2;
    targetMap[i + 0] = x1 - x2 + 127;
    if (flipY) {
      targetMap[i + 1] = y2 - y1 + 127;
    } else {
      targetMap[i + 1] = y1 - y2 + 127;
    }
    targetMap[i + 2] = 255;
    targetMap[i + 3] = 255;
  }

  return targetMap;
}
