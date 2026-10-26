# Colour flow: draft2

Page / (draft CSS injected: C:/Users/MOHAME~1/AppData/Local/Temp/claude/d--momentsShopify/af1ccec1-91ed-4176-83a6-21913200ec88/scratchpad/draft-test.css). Every pixel row of a gutter column, OKLab step x100 between consecutive rows. Limit 1.2 per row, no 1px lines, at most 3 resting surface tones (tones within dE 10 are one family). Hero media and header chrome are not measured.

## 1440px LTR: PASS
Height 6279px. Largest step 0.75 at y=4398. Resting surface tones: 2 (#3b1e3a, #faf6f2).


## 375px LTR: FAIL
Height 5089px. Largest step 54.72 at y=2356. Resting surface tones: 2 (#3b1e3a, #faf6f2).

- step 44.15 at y=2004 (col x=367) #faf6f2 -> #8a6a22
- 1px line at y=2004 (col x=367) #8a6a22 between #faf6f2 and #faf6f2
- step 44.15 at y=2005 (col x=367) #8a6a22 -> #faf6f2
- step 44.15 at y=2027 (col x=367) #faf6f2 -> #8a6a22
- 1px line at y=2027 (col x=367) #8a6a22 between #faf6f2 and #faf6f2
- step 44.15 at y=2028 (col x=367) #8a6a22 -> #faf6f2
- step 1.80 at y=2258 (col x=367) #faf6f2 -> #f4f0ec
- step 28.06 at y=2259 (col x=367) #f4f0ec -> #9f958f
- step 16.11 at y=2260 (col x=367) #9f958f -> #71655d
- step 16.22 at y=2263 (col x=367) #6e6059 -> #9a918a
- step 28.28 at y=2264 (col x=367) #9a918a -> #f0ece8
- step 3.00 at y=2265 (col x=367) #f0ece8 -> #faf6f2
- ... 41 more
