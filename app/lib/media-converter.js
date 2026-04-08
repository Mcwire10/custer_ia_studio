/**
 * Media Converter - Convert various image/video formats to JPEG for analysis
 * Supports: JPG, PNG, WebP, GIF, MP4, HEIC, AVIF
 */

import sharp from 'sharp'

/**
 * Main converter function - detects format and converts if needed
 */
export async function convertToJpeg(buffer, mimeType) {
  // Already JPEG/JPG
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return buffer
  }

  // PNG
  if (mimeType === 'image/png') {
    return await sharp(buffer).jpeg({ quality: 90, progressive: true }).toBuffer()
  }

  // WebP
  if (mimeType === 'image/webp') {
    return await sharp(buffer).jpeg({ quality: 90, progressive: true }).toBuffer()
  }

  // GIF - extract first frame
  if (mimeType === 'image/gif') {
    return await sharp(buffer, { animated: false }).jpeg({ quality: 90, progressive: true }).toBuffer()
  }

  // HEIC/HEIF
  if (mimeType === 'image/heic' || mimeType === 'image/heif') {
    return await sharp(buffer).jpeg({ quality: 90, progressive: true }).toBuffer()
  }

  // AVIF
  if (mimeType === 'image/avif') {
    return await sharp(buffer).jpeg({ quality: 90, progressive: true }).toBuffer()
  }

  // MP4 - extract key frames (need ffmpeg, for now return null)
  if (mimeType === 'video/mp4') {
    return await extractMP4Frames(buffer)
  }

  throw new Error(`Unsupported format: ${mimeType}`)
}

/**
 * Convert WebP to JPEG
 */
export async function convertWebP(buffer) {
  return await sharp(buffer).jpeg({ quality: 90, progressive: true }).toBuffer()
}

/**
 * Convert GIF to JPEG (first frame)
 */
export async function convertGIF(buffer) {
  return await sharp(buffer, { animated: false }).jpeg({ quality: 90, progressive: true }).toBuffer()
}

/**
 * Convert MP4 to JPEG frames
 * Returns array of frames (first 3 key frames recommended)
 */
export async function convertMP4(buffer) {
  // Note: Full MP4 extraction requires ffmpeg-static
  // For now, we return placeholder + fallback
  try {
    return await extractMP4Frames(buffer)
  } catch (error) {
    console.warn('MP4 extraction not fully supported, using placeholder:', error.message)
    return null
  }
}

/**
 * Extract frames from MP4 video buffer
 * This requires ffmpeg - for Node.js we'd use fluent-ffmpeg
 * For now, returning null as fallback
 */
async function extractMP4Frames(buffer) {
  // TODO: Implement with fluent-ffmpeg when available
  // For MVP: return null and let client handle video separately
  console.warn('MP4 frame extraction requires ffmpeg installation')
  return null
}

/**
 * Convert HEIC to JPEG
 */
export async function convertHEIC(buffer) {
  return await sharp(buffer).jpeg({ quality: 90, progressive: true }).toBuffer()
}

/**
 * Convert AVIF to JPEG
 */
export async function convertAVIF(buffer) {
  return await sharp(buffer).jpeg({ quality: 90, progressive: true }).toBuffer()
}

/**
 * Get supported formats
 */
export function getSupportedFormats() {
  return {
    images: [
      { mime: 'image/jpeg', ext: 'jpg', name: 'JPEG' },
      { mime: 'image/jpg', ext: 'jpg', name: 'JPG' },
      { mime: 'image/png', ext: 'png', name: 'PNG' },
      { mime: 'image/webp', ext: 'webp', name: 'WebP' },
      { mime: 'image/gif', ext: 'gif', name: 'GIF' },
      { mime: 'image/heic', ext: 'heic', name: 'HEIC' },
      { mime: 'image/heif', ext: 'heif', name: 'HEIF' },
      { mime: 'image/avif', ext: 'avif', name: 'AVIF' }
    ],
    videos: [{ mime: 'video/mp4', ext: 'mp4', name: 'MP4' }],
    all: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif',
      'image/avif',
      'video/mp4'
    ]
  }
}

/**
 * Validate file format
 */
export function isValidFormat(mimeType) {
  return getSupportedFormats().all.includes(mimeType)
}

/**
 * Validate image size
 */
export function isValidSize(buffer, maxSizeMB = 5) {
  const maxBytes = maxSizeMB * 1024 * 1024
  return buffer.length <= maxBytes
}

/**
 * Resize image if too large
 */
export async function resizeIfNeeded(buffer, maxWidth = 2000, maxHeight = 2000) {
  const metadata = await sharp(buffer).metadata()

  if (metadata.width > maxWidth || metadata.height > maxHeight) {
    return await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()
  }

  return buffer
}

/**
 * Detect MIME type from buffer (magic bytes)
 */
export function detectMimeType(buffer) {
  const hex = buffer.toString('hex', 0, 12).toUpperCase()

  // JPEG
  if (hex.startsWith('FFD8FF')) {
    return 'image/jpeg'
  }

  // PNG
  if (hex.startsWith('89504E47')) {
    return 'image/png'
  }

  // GIF
  if (hex.startsWith('474946')) {
    return 'image/gif'
  }

  // WebP
  if (hex.includes('57454250')) {
    return 'image/webp'
  }

  // HEIC/HEIF
  if (hex.includes('66747970') && (hex.includes('6865696335') || hex.includes('6865696336'))) {
    return 'image/heic'
  }

  // MP4
  if (hex.includes('66747970')) {
    return 'video/mp4'
  }

  return null
}
