import pptxgen from 'pptxgenjs';
import { downloadFile } from '../utils/download';
import { formatTimestamp, generateFilename } from '../utils/formatters';
import { Logger } from './logger';

interface ImageDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface SlideSection {
  title: string;
  content: string;
}

interface SlideStyleOptions {
  fontSize: number;
  color: string;
  breakLine: boolean;
  bold?: boolean;
}

const SLIDE_CONFIG = {
  WIDTH: 10,
  HEIGHT: 5.625,
  IMAGE_SCALE: 0.95,
  MARGIN: 0.025,
  TEXT_MARGIN: 0.5,
} as const;

const DEFAULTS = {
  MIME_TYPE: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  LAYOUT: 'LAYOUT_16x9',
} as const;

const SlideStyle: Record<string, SlideStyleOptions> = {
  titleStyle: { fontSize: 14, color: '363636', breakLine: true, bold: true },
  contentStyle: { fontSize: 12, color: '666666', breakLine: true },
  spaceStyle: { fontSize: 8, color: '666666', breakLine: true },
};

const calculateImageDimensions = (img: HTMLImageElement): ImageDimensions => {
  const imgRatio = img.width / img.height;
  const slideRatio = SLIDE_CONFIG.WIDTH / SLIDE_CONFIG.HEIGHT;
  const availableWidth = SLIDE_CONFIG.WIDTH * SLIDE_CONFIG.IMAGE_SCALE;
  const availableHeight = SLIDE_CONFIG.HEIGHT * SLIDE_CONFIG.IMAGE_SCALE;

  let width: number;
  let height: number;

  if (imgRatio > slideRatio) {
    width = availableWidth;
    height = width / imgRatio;
  } else {
    height = availableHeight;
    width = height * imgRatio;
  }

  const x = (SLIDE_CONFIG.WIDTH - width) / 2;
  const y = (SLIDE_CONFIG.HEIGHT - height) / 2;

  return { width, height, x, y };
};

const getImageDimensions = (base64ImageData: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = calculateImageDimensions(img);
      resolve(dimensions);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64ImageData;
  });
};

const generatePPTX = async (pptxData: string): Promise<Blob> => {
  const byteCharacters = atob(pptxData);
  const byteArray = new Uint8Array(byteCharacters.split('').map((char) => char.charCodeAt(0)));
  return new Blob([byteArray], { type: DEFAULTS.MIME_TYPE });
};

const createScreenshotSlide = async (pres: pptxgen, imageData: string) => {
  const slide = pres.addSlide();
  const imageDims = await getImageDimensions(imageData);
  slide.addImage({
    data: imageData,
    x: imageDims.x,
    y: imageDims.y,
    w: imageDims.width,
    h: imageDims.height,
  });
};

const createInfoSlide = (pres: pptxgen, sections: SlideSection[]) => {
  const slide = pres.addSlide();
  const texts = sections.map((section) => [
    { text: section.title, options: SlideStyle.titleStyle },
    { text: section.content, options: SlideStyle.contentStyle },
  ]);

  slide.addText(texts.flat(), {
    x: SLIDE_CONFIG.TEXT_MARGIN,
    y: SLIDE_CONFIG.TEXT_MARGIN,
    w: '95%',
    h: '90%',
    valign: 'top',
    margin: 10,
  });
};

export const shareAsPPT = async (
  imageData: string,
  comment: string,
  url: string,
  startTag: string,
  styleModifications: string
): Promise<true> => {
  const logger = new Logger('shareAsPPT');

  if (!imageData) throw new Error('Image data is required');
  if (!url) throw new Error('URL is required');

  try {
    const pres = new pptxgen();
    pres.layout = DEFAULTS.LAYOUT;

    const base64ImageData = imageData.startsWith('data:image/')
      ? imageData
      : `data:image/png;base64,${imageData}`;

    await createScreenshotSlide(pres, base64ImageData);

    const now = new Date();
    const sections: SlideSection[] = [
      { title: 'Date and time: ', content: formatTimestamp(now) },
      { title: 'URL: ', content: url },
      { title: 'Element start tag: ', content: startTag },
      { title: 'Comment: ', content: comment },
    ];

    createInfoSlide(pres, sections);

    const pptxOutput = await pres.write({ outputType: 'base64' });
    if (typeof pptxOutput !== 'string') {
      throw new Error('PowerPoint generation failed: Invalid output type');
    }

    const pptxBlob = await generatePPTX(pptxOutput);
    await downloadFile(pptxBlob, generateFilename(now, 'pptx'), {
      saveAs: false,
    });

    return true;
  } catch (error) {
    logger.error('PowerPoint generation and download failed:', error);
    throw error;
  }
};
