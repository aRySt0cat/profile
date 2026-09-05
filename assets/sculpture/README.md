# Open white book

`open-book.blend` contains only the new book scene. Browser files are
`public/assets/sculpture/open-book.glb` and `open-book-preview.png`.

The glTF uses Y-up, with the spine along Z. `WhiteBook` is the root;
`LeftWritingPage` and `RightWritingPage` have their writing surfaces at Y=.22.
Their flat inner area spans |X|=.39–3.37, Z=-2.36–2.36.

`TurningLeaf` pivots around [0,.231,0]; rotating local Z from 0 to π turns
it from right to left. It is hidden at rest. Covers and 16 separate leaves
on each side provide thickness, subtle edge curvature, and shadows.

`PaperSculpture.tsx` projects the DOM into the same camera coordinates as the
book, including text on the turning leaf. The HTML surfaces are sized in
projected pixels so changing screen size does not shrink the type. Mobile
uses one paper surface with all content in sequence.

The timeline contains profile, education, an activity contents spread, and one spread per filtered activity.
`npm run test:timeline` verifies dynamic counts, chapter boundaries, old deep
links, and reverse scrolling. No content is embedded in the 3D asset.
