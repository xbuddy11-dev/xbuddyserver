const fs   = require('fs')
const path = require('path')

const CONFIG_FILE = path.join(process.cwd(), 'shop-config.json')

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('\n  ERROR: shop-config.json not found!')
    console.error('  Please run setup.exe first to configure your shop.\n')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
}

module.exports = loadConfig()
