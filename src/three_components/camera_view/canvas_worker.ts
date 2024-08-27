let canvas = null;
let buffer = null;

export type DataType = {
  rgba: Uint8Array;
  width: number; // in pixels; width of the input buffer.
  height: number; // in pixels; height of the input buffer.
  downsample?: number;
  mimeType?: string;
  quality?: number;
}

type MethodType = {
  data: DataType;
  [key: string]: unknown;
}

// @ts-ignore
self.onmessage = function({
                            data: {
                              rgba,
                              width, // in pixels, width of the input buffer.
                              height, // in pixels, height of the input buffer.
                              downsample,
                              mimeType = 'image/jpeg',
                              quality = 1,
                            },
                          }: MethodType) {
  if (!!canvas) {
    canvas.width = Math.floor(width / downsample);
    canvas.height = Math.floor(height / downsample);
  } else {
    canvas = new OffscreenCanvas(width / downsample, height / downsample);
  }
  buffer = new Uint8Array(rgba);

  const n = downsample * downsample;
  const ctx = canvas.getContext('2d');

  const pixelHeight = ctx.canvas.height;
  const pixelWidth = ctx.canvas.width;
  const pixelCount = pixelWidth * pixelHeight;

  const imgData = ctx.getImageData(0, 0, pixelWidth, pixelHeight);
  const data = new Array(pixelCount * 4).fill(0);  // the array of RGBA values


  for (let i = 0; i < height; i++) {
    const row_start = (height - 1 - i) * width;
    // const row_start = i * width * dpr;
    const flipY = Math.floor(i / downsample);
    const target_row_start = pixelWidth * flipY;
    for (let j = 0; j < width; j++) {
      const cell_start = row_start * 4 + j * 4;
      const target_cell_start = target_row_start * 4 + Math.floor(j / downsample) * 4;

      data[target_cell_start] += buffer[cell_start];     // red
      data[target_cell_start + 1] += buffer[cell_start + 1]; // green
      data[target_cell_start + 2] += buffer[cell_start + 2]; // blue
      data[target_cell_start + 3] += buffer[cell_start + 3]; // alpha
    }
  }

  for (let i = 0; i < (pixelCount * 4); i += 4) {
    imgData.data[i] = data[i] / n;
    imgData.data[i + 1] = data[i + 1] / n;
    imgData.data[i + 2] = data[i + 2] / n;
    imgData.data[i + 3] = data[i + 3] / n;
  }

  ctx.putImageData(imgData, 0, 0);
  canvas.convertToBlob({ quality, type: mimeType }).then((blob) => blob.arrayBuffer()).then((array: ArrayBuffer) => {
    self.postMessage({ jpg: array, width, height }, '*', [array as Transferable]);
  });
};