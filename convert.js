const fs = require('fs')

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const colorRe = /rgb ([\d]*) ([\d]*) ([\d]*) ([\d]*)/

const CCOLS_START_LINE = 'ccols'
const CLEV_START_LINE = 'clevs'

const getWhiteSpaces = (n) => (new Array(n + 1)).fill('').join(' ')

const baseStyle = `
symbolizers:
- raster:
    color-map:
      type: ramp
      entries:`

const convertGradToGeoserver = (path) => {
  const lines = fs.readFileSync(path, 'utf8').split('\n');

  let ccols = null;
  let clevs = null;
  let colors = [];

  lines.forEach(line => {
    if(line.startsWith(CCOLS_START_LINE)){
      ccols = line.replace(CCOLS_START_LINE, '').split(' ')
    }
    if(line.startsWith(CLEV_START_LINE)){
      clevs = line.replace(CLEV_START_LINE, '').split(' ')
    }
    if(line.startsWith('rgb')){
      colors.push(line);
    }
  })

  const levelRGB = {}

  ccols.forEach((c, index) => {
    levelRGB[c] = clevs[index]
  })

  const rampLevels = []

  colors.forEach(c => {
    const [regexMatch, id, r, g, b] = c.match(colorRe);

    rampLevels.push([rgbToHex(+r, +g, +b), 1, +levelRGB[+id], ''])
  })

  const r = rampLevels.filter(r => !isNaN(r[2])).sort((a, b) =>{
    return +a[2] - b[2]
  })

  const w = getWhiteSpaces(8);

  const prettyPrint = r.map(r => `${w}- ${JSON.stringify(r)}`).join('\n').replace(/"/g, "'",)

  console.log(`${baseStyle}\n${prettyPrint}`)
}

convertGradToGeoserver(process.argv[2]);
