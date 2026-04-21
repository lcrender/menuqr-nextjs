/**
 * Cálculo del área recortada en píxeles (coordenadas sobre la imagen natural),
 * alineado con la lógica interna de react-easy-crop (getCropData / computeCroppedArea).
 * Sirve para exportar al canvas evitando desfases cuando el zoom cambió y el callback
 * aún recibió crop en props desactualizado (p. ej. issue en recomputeCropPosition).
 *
 * Licencia MIT — derivado del paquete react-easy-crop (Valentin Hervieu).
 */
import type { Area, MediaSize, Point, Size } from 'react-easy-crop';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

function restrictPositionCoord(position: number, mediaAxis: number, cropAxis: number, zoom: number): number {
  const maxPosition = Math.abs((mediaAxis * zoom) / 2 - cropAxis / 2);
  return clamp(position, -maxPosition, maxPosition);
}

export function restrictPositionEasyCrop(
  position: Point,
  mediaSize: MediaSize,
  cropSize: Size,
  zoom: number,
  rotation: number,
): Point {
  const { width, height } = rotateSize(mediaSize.width, mediaSize.height, rotation);
  return {
    x: restrictPositionCoord(position.x, width, cropSize.width, zoom),
    y: restrictPositionCoord(position.y, height, cropSize.height, zoom),
  };
}

function limitArea(max: number, value: number): number {
  return Math.min(max, Math.max(0, value));
}

function noOp(_max: number, value: number): number {
  return value;
}

function computeCroppedAreaPixels(
  crop: Point,
  mediaSize: MediaSize,
  cropSize: Size,
  aspect: number,
  zoom: number,
  rotation: number,
  restrictPositionFlag: boolean,
): Area {
  const limitAreaFn = restrictPositionFlag ? limitArea : noOp;
  const mediaBBoxSize = rotateSize(mediaSize.width, mediaSize.height, rotation);
  const mediaNaturalBBoxSize = rotateSize(mediaSize.naturalWidth, mediaSize.naturalHeight, rotation);

  const croppedAreaPercentages = {
    x: limitAreaFn(
      100,
      (((mediaBBoxSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) / mediaBBoxSize.width) * 100,
    ),
    y: limitAreaFn(
      100,
      (((mediaBBoxSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) / mediaBBoxSize.height) * 100,
    ),
    width: limitAreaFn(100, ((cropSize.width / mediaBBoxSize.width) * 100) / zoom),
    height: limitAreaFn(100, ((cropSize.height / mediaBBoxSize.height) * 100) / zoom),
  };

  const widthInPixels = Math.round(
    limitAreaFn(
      mediaNaturalBBoxSize.width,
      (croppedAreaPercentages.width * mediaNaturalBBoxSize.width) / 100,
    ),
  );
  const heightInPixels = Math.round(
    limitAreaFn(
      mediaNaturalBBoxSize.height,
      (croppedAreaPercentages.height * mediaNaturalBBoxSize.height) / 100,
    ),
  );

  const isImgWiderThanHigh = mediaNaturalBBoxSize.width >= mediaNaturalBBoxSize.height * aspect;
  const sizePixels = isImgWiderThanHigh
    ? { width: Math.round(heightInPixels * aspect), height: heightInPixels }
    : { width: widthInPixels, height: Math.round(widthInPixels / aspect) };

  return {
    x: Math.round(
      limitAreaFn(
        mediaNaturalBBoxSize.width - sizePixels.width,
        (croppedAreaPercentages.x * mediaNaturalBBoxSize.width) / 100,
      ),
    ),
    y: Math.round(
      limitAreaFn(
        mediaNaturalBBoxSize.height - sizePixels.height,
        (croppedAreaPercentages.y * mediaNaturalBBoxSize.height) / 100,
      ),
    ),
    width: sizePixels.width,
    height: sizePixels.height,
  };
}

export type EasyCropExportArgs = {
  crop: Point;
  zoom: number;
  rotation?: number;
  aspect: number;
  mediaSize: MediaSize;
  cropSize: Size;
  restrictPosition?: boolean;
};

/** Equivalente a getCropData().croppedAreaPixels del Cropper con el estado actual. */
export function getEasyCropPixelsForExport(args: EasyCropExportArgs): Area {
  const {
    crop,
    zoom,
    rotation = 0,
    aspect,
    mediaSize,
    cropSize,
    restrictPosition: rp = true,
  } = args;
  const restricted = rp ? restrictPositionEasyCrop(crop, mediaSize, cropSize, zoom, rotation) : crop;
  return computeCroppedAreaPixels(restricted, mediaSize, cropSize, aspect, zoom, rotation, rp);
}
