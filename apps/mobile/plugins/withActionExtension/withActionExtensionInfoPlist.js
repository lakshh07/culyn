'use strict'

const plist = require('@expo/plist')
const { withInfoPlist } = require('expo/config-plugins')
const fs = require('fs')
const path = require('path')
const { getActionExtensionName, getAppGroup } = require('./helpers')

function withActionExtensionInfoPlist(config) {
  return withInfoPlist(config, (config) => {
    const targetName = getActionExtensionName(config)
    const targetPath = path.join(config.modRequest.platformProjectRoot, targetName)
    const filePath = path.join(targetPath, 'Info.plist')
    const appGroup = getAppGroup(config)

    const infoPlist = {
      CFBundleDevelopmentRegion: '$(DEVELOPMENT_LANGUAGE)',
      CFBundleDisplayName: 'Save to Culyn',
      CFBundleExecutable: '$(EXECUTABLE_NAME)',
      CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)',
      CFBundleInfoDictionaryVersion: '6.0',
      CFBundleName: '$(PRODUCT_NAME)',
      CFBundlePackageType: '$(PRODUCT_BUNDLE_PACKAGE_TYPE)',
      CFBundleShortVersionString: '$(MARKETING_VERSION)',
      CFBundleVersion: '$(CURRENT_PROJECT_VERSION)',
      LSRequiresIPhoneOS: true,
      AppGroup: appGroup,
      HostAppScheme: config.scheme,
      NSExtension: {
        NSExtensionAttributes: {
          NSExtensionActivationRule: {
            NSExtensionActivationSupportsWebURLWithMaxCount: 1,
          },
          NSExtensionServiceRoleType: 'NSExtensionServiceRoleTypeEditor',
        },
        NSExtensionPointIdentifier: 'com.apple.ui-services',
        NSExtensionPrincipalClass: '$(PRODUCT_MODULE_NAME).ActionViewController',
      },
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, plist.default.build(infoPlist))

    return config
  })
}

module.exports = { withActionExtensionInfoPlist }
