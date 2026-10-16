#!/usr/bin/env python3
import sys
import os
import cv2
import numpy as np
from PIL import Image

def clean_image(input_path: str, output_path: str = None) -> bool:
    if not output_path:
        output_path = input_path

    try:
        pil_img = Image.open(input_path).convert('RGB')
        img = np.array(pil_img)
        h, w, _ = img.shape

        if h < 50 or w < 50:
            # Image too small to process
            return False

        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        r = img[:, :, 0].astype(np.int32)
        g = img[:, :, 1].astype(np.int32)
        b = img[:, :, 2].astype(np.int32)
        neutral_diff = np.maximum(np.abs(r - g), np.maximum(np.abs(g - b), np.abs(r - b)))

        # Part mask: anything dark or with distinct color
        part_mask = (gray < 190) | (neutral_diff > 12)

        # Faint gray watermark: neutral tone in near-white luminance range
        faint_gray_mask = (gray >= 195) & (gray <= 253) & (neutral_diff <= 10)

        # Potential white/near-white background
        potential_bg = (gray >= 195) & (neutral_diff <= 12)

        # Flood fill from image perimeter / corners to find all connected background
        cv2_flood = (potential_bg.astype(np.uint8) * 255).copy()
        mask_connected_bg = np.zeros((h, w), dtype=bool)
        
        sample_points = [
            (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
            (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
            (w // 4, 0), (3 * w // 4, 0), (w // 4, h - 1), (3 * w // 4, h - 1)
        ]

        for cx, cy in sample_points:
            if potential_bg[cy, cx]:
                ff_mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
                cv2.floodFill(cv2_flood, ff_mask, (cx, cy), 128)
                mask_connected_bg |= (cv2_flood == 128)

        white_dilated = cv2.dilate((gray >= 252).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        watermark_mask = faint_gray_mask & (mask_connected_bg | white_dilated)

        # Overlap with part border:
        part_border = cv2.dilate(part_mask.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        overlap = watermark_mask & part_border
        open_bg_wm = watermark_mask & (~part_border)

        res = img.copy()

        # Inpaint boundary pixels where watermark touches part edges
        if overlap.sum() > 0:
            res = cv2.inpaint(res, overlap.astype(np.uint8) * 255, 3, cv2.INPAINT_TELEA)

        # Pure white fill for open background watermark pixels
        if open_bg_wm.sum() > 0:
            res[open_bg_wm] = [255, 255, 255]

        # Check for bottom branding banner (e.g. blue strip [25, 96, 170] in lower 12%)
        bottom_start = int(h * 0.88)
        blue_banner = (res[bottom_start:, :, 0] < 60) & \
                      (res[bottom_start:, :, 1] > 60) & (res[bottom_start:, :, 1] < 140) & \
                      (res[bottom_start:, :, 2] > 120)
        
        # If blue banner covers a significant strip of the bottom
        if blue_banner.sum() > (w * (h - bottom_start) * 0.25):
            banner_rows = np.where(blue_banner.any(axis=1))[0]
            if len(banner_rows):
                banner_top = bottom_start + banner_rows.min()
                # Check if mechanical part extends into this bottom area
                part_in_bottom = part_mask[banner_top:, :].sum() - blue_banner.sum()
                if part_in_bottom < (w * (h - banner_top) * 0.1):
                    res[banner_top:, :] = [255, 255, 255]

        # Save result
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        out_pil = Image.fromarray(res)
        
        ext = os.path.splitext(output_path)[1].lower()
        if ext in ['.jpg', '.jpeg']:
            out_pil.save(output_path, 'JPEG', quality=95, optimize=True)
        elif ext == '.webp':
            out_pil.save(output_path, 'WEBP', quality=95)
        elif ext == '.png':
            out_pil.save(output_path, 'PNG', optimize=True)
        else:
            out_pil.save(output_path, quality=95)

        return True
    except Exception as e:
        sys.stderr.write(f"Error cleaning {input_path}: {e}\n")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python clean-watermark.py <input_path> [output_path]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else input_path

    success = clean_image(input_path, output_path)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
