'use strict'

const plist = require('@expo/plist')
const { withEntitlementsPlist } = require('expo/config-plugins')
const fs = require('fs')
const path = require('path')
const { getActionExtensionName, getAppGroup } = require('./helpers')

function withActionExtensionEntitlements(config) {
  return withEntitlementsPlist(config, config => {
    const targetName = getActionExtensionName(config)
    const targetPath = path.join(config.modRequest.platformProjectRoot, targetName)
    const filePath = path.join(targetPath, `${targetName}.entitlements`)

    const existingAppGroup = config.ios?.entitlements?.['com.apple.security.application-groups']

    const entitlements = {
      'com.apple.security.application-groups': existingAppGroup ?? [getAppGroup(config)],
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, plist.default.build(entitlements))

    return config
  })
}

module.exports = { withActionExtensionEntitlements }
