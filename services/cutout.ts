const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

export const createAutoCutout = async (imageData: string, tolerance = 36): Promise<string> => {
  const img = new Image();
  img.src = imageData;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not load source image for cutout.'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas not available in this browser.');
  }

  ctx.drawImage(img, 0, 0);
  const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageDataObj.data;
  const width = canvas.width;
  const height = canvas.height;

  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1]
  ];

  const avg = corners.reduce(
    (acc, [x, y]) => {
      const idx = (y * width + x) * 4;
      acc.r += data[idx];
      acc.g += data[idx + 1];
      acc.b += data[idx + 2];
      return acc;
    },
    { r: 0, g: 0, b: 0 }
  );

  const bgColor = {
    r: avg.r / corners.length,
    g: avg.g / corners.length,
    b: avg.b / corners.length
  };

  for (let i = 0; i < data.length; i += 4) {
    const dist = colorDistance(data[i], data[i + 1], data[i + 2], bgColor.r, bgColor.g, bgColor.b);
    if (dist < tolerance) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageDataObj, 0, 0);
  return canvas.toDataURL('image/png');
};
