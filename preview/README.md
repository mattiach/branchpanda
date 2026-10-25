# Preview

BranchPanda preview images. Update the source screenshots when the interface
changes, then regenerate the finished images from the HTML templates.

- `screenshots/` - app captures, taken by hand.
- `src/16-9/` - templates for the 1920 × 1080 preview images.
- `renders/16-9/` - generated PNGs. Never edit these by hand.

## Updating previews

1. Save clean, uncropped captures in `screenshots/`:

   | File | Screen |
   | --- | --- |
   | `1.png` | BranchPanda open over a public GitHub repository, with the repository tree and a file open in the viewer |
   | `2.png` | The BranchPanda home screen, showing the repository field, recent repositories, and example repositories |

2. From the repository root, run:

   ```sh
   pnpm generate:previews
   ```

3. Review the PNGs in `renders/16-9/`. The explorer template crops its wide
   capture to keep the extension panel in view; the home-screen template fits
   the complete capture in the frame. Adjust `.shot--wide img` or
   `.shot--portrait img` in `src/16-9/shot.css` if the source captures change.

Set `EDGE_PATH` if Microsoft Edge is installed somewhere other than the
default Windows location.
