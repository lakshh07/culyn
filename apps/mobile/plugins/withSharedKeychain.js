'use strict'

const plist = require('@expo/plist')
const { withEntitlementsPlist, IOSConfig } = require('expo/config-plugins')
const fs = require('fs')
const path = require('path')

// Must match SHARED_KEYCHAIN_GROUP in lib/shared-keychain.ts
// $(AppIdentifierPrefix) expands to TEAMID. at Xcode build time
const KEYCHAIN_ACCESS_GROUPS = ['$(AppIdentifierPrefix)com.culyn-ai']

module.exports = function withSharedKeychain(config) {
  // 1. Add keychain-access-groups to the main app entitlements
  config = withEntitlementsPlist(config, c => {
    c.modResults['keychain-access-groups'] = KEYCHAIN_ACCESS_GROUPS
    return c
  })

  // 2. Add keychain-access-groups to the share extension entitlements.
  // expo-share-extension writes the extension entitlements file inside its own
  // withEntitlementsPlist callback. Since this plugin runs AFTER expo-share-extension
  // in the plugins array, our withEntitlementsPlist callback runs after theirs,
  // meaning the file already exists when we reach here.
  config = withEntitlementsPlist(config, c => {
    const appName = IOSConfig.XcodeUtils.sanitizedName(c.modRequest.projectName ?? c.name)
    const shareExtName = `${appName}ShareExtension`
    const shareExtPath = path.join(
      c.modRequest.platformProjectRoot,
      shareExtName,
      `${shareExtName}.entitlements`
    )

    if (fs.existsSync(shareExtPath)) {
      const existing = plist.default.parse(fs.readFileSync(shareExtPath, 'utf8'))
      existing['keychain-access-groups'] = KEYCHAIN_ACCESS_GROUPS
      fs.writeFileSync(shareExtPath, plist.default.build(existing))
      console.log(
        '[withSharedKeychain] keychain-access-groups added to',
        shareExtName + '.entitlements'
      )
    } else {
      console.warn('[withSharedKeychain] Share extension entitlements not found:', shareExtPath)
    }

    return c
  })

  return config
}
