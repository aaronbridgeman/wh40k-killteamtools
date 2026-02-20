# Operative Images

This directory contains operative images for each faction.

## Structure

```
operatives/
├── angels-of-death/
│   ├── operative-name.webp
│   └── ...
└── plague-marines/
    ├── operative-name.webp
    └── ...
```

## Image Guidelines

- Format: WebP (preferred) or PNG
- Dimensions: 512x512 pixels (recommended)
- Naming: Use lowercase with hyphens (e.g., `intercessor-sergeant.webp`)
- Size: Keep under 200KB per image

## Adding Images

1. Extract images from official PDFs or source material
2. Resize to standard dimensions
3. Convert to WebP format for optimal size
4. Place in appropriate faction folder
5. Reference in operative configuration using the path: `/images/operatives/{faction-id}/{image-name}.webp`

## Placeholder

If an operative image is not available, the application will gracefully handle the missing image. You can add a placeholder image later.
