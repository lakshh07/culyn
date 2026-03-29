'use strict'

const { withXcodeProject } = require('expo/config-plugins')
const fs = require('fs')
const path = require('path')
const { getActionExtensionBundleIdentifier, getActionExtensionName } = require('./helpers')

function withActionExtensionTarget(config) {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults
    const targetName = getActionExtensionName(config)

    // Idempotency: skip if target already exists
    if (xcodeProject.pbxTargetByName(targetName)) {
      return config
    }

    const bundleIdentifier = getActionExtensionBundleIdentifier(config)
    const marketingVersion = config.version ?? '1.0.0'
    const currentProjectVersion = config.ios?.buildNumber ?? '1'
    const targetUuid = xcodeProject.generateUuid()
    const { platformProjectRoot } = config.modRequest

    // 1. Copy ActionViewController.swift to target directory
    const targetDir = path.join(platformProjectRoot, targetName)
    fs.mkdirSync(targetDir, { recursive: true })

    const swiftSrc = path.join(__dirname, 'swift', 'ActionViewController.swift')
    const swiftDst = path.join(targetDir, 'ActionViewController.swift')
    fs.writeFileSync(swiftDst, fs.readFileSync(swiftSrc))

    // 2. Add XCConfigurationList
    const commonBuildSettings = {
      CLANG_ENABLE_MODULES: 'YES',
      CURRENT_PROJECT_VERSION: `"${currentProjectVersion}"`,
      INFOPLIST_FILE: `${targetName}/Info.plist`,
      IPHONEOS_DEPLOYMENT_TARGET: '"15.1"',
      LD_RUNPATH_SEARCH_PATHS:
        '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
      PRODUCT_BUNDLE_IDENTIFIER: `"${bundleIdentifier}"`,
      PRODUCT_NAME: `"${targetName}"`,
      SWIFT_VERSION: '5.0',
      VERSIONING_SYSTEM: '"apple-generic"',
      CODE_SIGN_ENTITLEMENTS: `${targetName}/${targetName}.entitlements`,
      GENERATE_INFOPLIST_FILE: 'YES',
      MARKETING_VERSION: `"${marketingVersion}"`,
      ENABLE_ON_DEMAND_RESOURCES: 'NO',
    }

    const xCConfigurationList = xcodeProject.addXCConfigurationList(
      [
        {
          name: 'Debug',
          isa: 'XCBuildConfiguration',
          buildSettings: {
            ...commonBuildSettings,
            SWIFT_ACTIVE_COMPILATION_CONDITIONS: 'DEBUG',
          },
        },
        {
          name: 'Release',
          isa: 'XCBuildConfiguration',
          buildSettings: { ...commonBuildSettings },
        },
      ],
      'Release',
      `Build configuration list for PBXNativeTarget "${targetName}"`,
    )

    // 3. Add product file
    const productFile = xcodeProject.addProductFile(targetName, {
      group: 'Copy Files',
      explicitFileType: 'wrapper.app-extension',
    })
    xcodeProject.addToPbxBuildFileSection(productFile)

    // 4. Add native target
    const target = {
      uuid: targetUuid,
      pbxNativeTarget: {
        isa: 'PBXNativeTarget',
        name: targetName,
        productName: targetName,
        productReference: productFile.fileRef,
        productType: '"com.apple.product-type.app-extension"',
        buildConfigurationList: xCConfigurationList.uuid,
        buildPhases: [],
        buildRules: [],
        dependencies: [],
      },
    }
    xcodeProject.addToPbxNativeTargetSection(target)

    // 5. Add to project section + target attributes
    xcodeProject.addToPbxProjectSection(target)
    const projectSection = xcodeProject.pbxProjectSection()
    const firstProjectUuid = xcodeProject.getFirstProject().uuid
    if (!projectSection[firstProjectUuid].attributes.TargetAttributes) {
      projectSection[firstProjectUuid].attributes.TargetAttributes = {}
    }
    projectSection[firstProjectUuid].attributes.TargetAttributes[targetUuid] = {
      LastSwiftMigration: 1250,
    }

    // 6. Add target dependency from main app → action extension
    if (!xcodeProject.hash.project.objects['PBXTargetDependency']) {
      xcodeProject.hash.project.objects['PBXTargetDependency'] = {}
    }
    if (!xcodeProject.hash.project.objects['PBXContainerItemProxy']) {
      xcodeProject.hash.project.objects['PBXContainerItemProxy'] = {}
    }
    xcodeProject.addTargetDependency(xcodeProject.getFirstTarget().uuid, [targetUuid])

    // 7. Add PBX group
    const files = ['ActionViewController.swift', 'Info.plist', `${targetName}.entitlements`]
    const { uuid: pbxGroupUuid } = xcodeProject.addPbxGroup(files, targetName, targetName)
    const groups = xcodeProject.hash.project.objects['PBXGroup']
    if (pbxGroupUuid) {
      Object.keys(groups).forEach((key) => {
        if (groups[key].name === undefined && groups[key].path === undefined) {
          xcodeProject.addToPbxGroup(pbxGroupUuid, key)
        }
      })
    }

    // 8. Add build phases for the action extension target (no RN bundling scripts)
    const buildPath = '"$(CONTENTS_FOLDER_PATH)/PlugIns"'
    const targetType = 'app_extension'

    xcodeProject.addBuildPhase(
      ['ActionViewController.swift'],
      'PBXSourcesBuildPhase',
      'Sources',
      targetUuid,
      targetType,
      buildPath,
    )

    xcodeProject.addBuildPhase(
      [],
      'PBXFrameworksBuildPhase',
      'Frameworks',
      targetUuid,
      targetType,
      buildPath,
    )

    xcodeProject.addBuildPhase(
      [],
      'PBXResourcesBuildPhase',
      'Resources',
      targetUuid,
      targetType,
      buildPath,
    )

    // 9. Embed the .appex in the main app
    //    Reuse existing "Embed Foundation Extensions" phase if present (added by share extension)
    const mainTargetUuid = xcodeProject.getFirstTarget().uuid
    const copyFilePhases = xcodeProject.hash.project.objects['PBXCopyFilesBuildPhase'] ?? {}
    const mainTarget = xcodeProject.pbxNativeTargetSection()[mainTargetUuid]
    const mainBuildPhaseUuids = (mainTarget?.buildPhases ?? []).map((bp) => bp.value)

    const hasEmbedPhase = mainBuildPhaseUuids.some((uuid) => {
      const phase = copyFilePhases[uuid]
      return (
        phase &&
        (phase.name === '"Embed Foundation Extensions"' ||
          phase.name === 'Embed Foundation Extensions')
      )
    })

    if (!hasEmbedPhase) {
      xcodeProject.addBuildPhase(
        [],
        'PBXCopyFilesBuildPhase',
        'Embed Foundation Extensions',
        mainTargetUuid,
        targetType,
      )
    }

    xcodeProject.addToPbxCopyfilesBuildPhase(productFile)

    return config
  })
}

module.exports = { withActionExtensionTarget }
