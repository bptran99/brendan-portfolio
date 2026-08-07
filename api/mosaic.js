import { readdir } from 'node:fs/promises';
import path from 'node:path';

const MOSAIC_DIRECTORY = path.join(process.cwd(), 'assets', 'mosaic');
const SUPPORTED_IMAGE = /\.(avif|gif|jpe?g|png|webp)$/i;

function imageLabel(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const entries = await readdir(MOSAIC_DIRECTORY, { withFileTypes: true });
    const images = entries
      .filter((entry) => entry.isFile() && SUPPORTED_IMAGE.test(entry.name))
      .sort((first, second) => first.name.localeCompare(second.name, undefined, { numeric: true }))
      .map((entry) => ({
        src: `/assets/mosaic/${encodeURIComponent(entry.name)}`,
        label: imageLabel(entry.name),
      }));

    response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
    return response.status(200).json({ images });
  } catch {
    return response.status(200).json({ images: [] });
  }
}
