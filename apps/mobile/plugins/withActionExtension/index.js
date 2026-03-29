'use strict'

const { withPlugins } = require('expo/config-plugins')
const { withActionExtensionInfoPlist } = require('./withActionExtensionInfoPlist')
const { withActionExtensionEntitlements } = require('./withActionExtensionEntitlements')
const { withActionExtensionTarget } = require('./withActionExtensionTarget')
const {
  getAppGroup,
  getAppBundleIdentifier,
  getActionExtensionName,
  getActionExtensionBundleIdentifier,
} = require('./helpers')

function withActionExtension(config) {
  return withPlugins(config, [
    withActionExtensionInfoPlist,
    withActionExtensionEntitlements,
    withActionExtensionTarget,
  ])
}

module.exports = withActionExtension
module.exports.getAppGroup = getAppGroup
module.exports.getAppBundleIdentifier = getAppBundleIdentifier
module.exports.getActionExtensionBundleIdentifier = getActionExtensionBundleIdentifier
module.exports.getActionExtensionName = getActionExtensionName
