// One tonal recipe for the six moments (OKLCH): same lightness and chroma steps, only the hue changes. Prints the CSS tokens and
// checks contrast. usage: node scripts/moment-palette.mjs
const HUES = { night: 318, gift: 345, allday: 82, daily: 48, fresh: 152, love: 12 };
const STEPS = { field: [0.5, 0.12], deep: [0.4, 0.1], soft: [0.93, 0.035], ink: [0.3, 0.07] };
const toSrgb = (L, C, h) => {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return lin.map((v) => { v = Math.min(1, Math.max(0, v)); return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)); });
};
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PEARL = [250, 246, 242], PLUMINK = [59, 30, 58];
let bad = 0;
for (const [name, h] of Object.entries(HUES)) {
  const t = Object.fromEntries(Object.entries(STEPS).map(([k, [L, C]]) => [k, toSrgb(L, C, h)]));
  const checks = [['pearl on field', cr(PEARL, t.field)], ['pearl on deep', cr(PEARL, t.deep)], ['ink on soft', cr(t.ink, t.soft)], ['deep on soft', cr(t.deep, t.soft)]];
  const fail = checks.filter(([, v]) => v < 4.5); if (fail.length) bad++;
  console.log(`${name.padEnd(7)} h${h}  field ${hex(t.field)}  deep ${hex(t.deep)}  soft ${hex(t.soft)}  ink ${hex(t.ink)}  | ${checks.map(([n, v]) => n + ' ' + v.toFixed(1)).join(', ')} ${fail.length ? 'FAIL' : ''}`);
}
process.exit(bad ? 1 : 0);
