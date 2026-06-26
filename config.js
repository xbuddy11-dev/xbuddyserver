const fs       = require('fs')
const path     = require('path')
const readline = require('readline')

const CONFIG_CACHE = path.join(process.cwd(), 'shop-config.json')

async function fetchConfigFromFirestore(email, password) {
  const { initializeApp, cert } = require('firebase-admin/app')
  const { getFirestore }        = require('firebase-admin/firestore')
  const axios                   = require('axios')

  // Sign in with email/password via Firebase REST API
  const apiKey = 'AIzaSyBSbCSHDiM58lCOJCTS91U8HVXorFl4x98'
  const res = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    { email, password, returnSecureToken: true }
  )
  const uid = res.data.localId

  // Init firebase-admin with service account
  const apps = require('firebase-admin/app').getApps()
  if (!apps.length) {
    initializeApp({ credential: cert(require('./credentials.json')) })
  }

  const db   = getFirestore()
  const snap = await db.collection('shops').doc(uid).get()
  if (!snap.exists) throw new Error('Shop not found. Please complete setup on the website first.')
  return snap.data()
}

async function loadConfig() {
  // If cached config exists, use it
  if (fs.existsSync(CONFIG_CACHE)) {
    return JSON.parse(fs.readFileSync(CONFIG_CACHE, 'utf8'))
  }

  // Otherwise ask for login credentials
  const rl  = readline.createInterface({ input: process.stdin, output: process.stdout })
  const ask = (q) => new Promise(res => rl.question(q, res))

  console.log('\n  X Buddy Print Agent — First Time Login\n')
  const email    = await ask('  Enter your X Buddy email: ')
  const password = await ask('  Enter your password: ')
  rl.close()

  console.log('\n  Fetching your shop config...')
  const config = await fetchConfigFromFirestore(email, password)
  fs.writeFileSync(CONFIG_CACHE, JSON.stringify(config, null, 2))
  console.log(`  ✅ Shop "${config.shopName}" connected!\n`)
  return config
}

module.exports = loadConfig()
