# Colour flow: before

Page /. Every pixel row of a gutter column, OKLab step x100 between consecutive rows. Limit 1.2 per row, no 1px lines, at most 3 resting surface tones (tones within dE 10 are one family). Hero media and header chrome are not measured.

## 1440px LTR: FAIL
Height 5384px. Largest step 69.17 at y=31. Resting surface tones: 4 (#faf6f2, #3b1e3a, #e9cfc8, #624000).

- step 69.17 at y=31 (col x=24) #3b1e3a -> #faf6f2
- step 19.40 at y=919 (col x=24) #251224 -> #544553
- step 9.60 at y=920 (col x=24) #544553 -> #3c2b3b
- step 9.80 at y=921 (col x=24) #3c2b3b -> #251224
- step 15.05 at y=942 (col x=24) #251224 -> #493948
- step 8.66 at y=943 (col x=24) #493948 -> #342233
- step 6.39 at y=944 (col x=24) #342233 -> #251224
- step 54.17 at y=979 (col x=24) #251224 -> #cda553
- 1px line at y=979 (col x=24) #cda553 between #251224 and #3b1e3a
- step 47.93 at y=980 (col x=24) #cda553 -> #3b1e3a
- step 59.06 at y=2472 (col x=24) #3b1e3a -> #e9cfc8
- step 38.96 at y=3177 (col x=24) #e9cfc8 -> #914373
- ... 23 more

## 375px LTR: FAIL
Height 4514px. Largest step 69.17 at y=31. Resting surface tones: 4 (#faf6f2, #251224, #e9cfc8, #624000).

- step 69.17 at y=31 (col x=8) #3b1e3a -> #faf6f2
- step 54.17 at y=758 (col x=8) #251224 -> #cda553
- 1px line at y=758 (col x=8) #cda553 between #251224 and #3b1e3a
- step 47.93 at y=759 (col x=8) #cda553 -> #3b1e3a
- step 59.06 at y=1615 (col x=8) #3b1e3a -> #e9cfc8
- step 39.28 at y=2224 (col x=8) #e9cfc8 -> #904272
- step 13.61 at y=2908 (col x=8) #73325a -> #624000
- step 16.51 at y=3753 (col x=8) #624000 -> #3b1e3a
- step 69.17 at y=31 (col x=367) #3b1e3a -> #faf6f2
- step 54.17 at y=758 (col x=367) #251224 -> #cda553
- 1px line at y=758 (col x=367) #cda553 between #251224 and #3b1e3a
- step 47.93 at y=759 (col x=367) #cda553 -> #3b1e3a
- ... 59 more
