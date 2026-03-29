'use strict'

const { IOSConfig } = require('expo/config-plugins')

function getAppBundleIdentifier(config) {
  if (!config.ios?.bundleIdentifier) throw new Error('No bundle identifier')
  return config.ios.bundleIdentifier
}

function getAppGroup(config) {
  if (config.ios?.infoPlist?.AppGroup) return config.ios.infoPlist.AppGroup
  if (config.ios?.infoPlist?.AppGroupIdentifier) return config.ios.infoPlist.AppGroupIdentifier
  return `group.${getAppBundleIdentifier(config)}`
}

function getActionExtensionName(config) {
  return `${IOSConfig.XcodeUtils.sanitizedName(config.name)}ActionExtension`
}

function getActionExtensionBundleIdentifier(config) {
  return `${getAppBundleIdentifier(config)}.action`
}

module.exports = {
  getAppBundleIdentifier,
  getAppGroup,
  getActionExtensionName,
  getActionExtensionBundleIdentifier,
}
