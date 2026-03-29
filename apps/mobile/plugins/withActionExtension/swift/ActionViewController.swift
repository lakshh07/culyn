import UIKit
import UniformTypeIdentifiers

class ActionViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        extractURLAndOpen()
    }

    private func extractURLAndOpen() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            completeRequest()
            return
        }

        let group = DispatchGroup()
        var extractedURL: URL?

        for item in extensionItems {
            for provider in item.attachments ?? [] {
                if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    group.enter()
                    provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (urlItem, _) in
                        if let url = urlItem as? URL, !url.isFileURL {
                            extractedURL = url
                        }
                        group.leave()
                    }
                }
            }
        }

        group.notify(queue: .main) { [weak self] in
            guard let self = self else { return }
            if let url = extractedURL {
                self.openHostApp(with: url)
            } else {
                self.completeRequest()
            }
        }
    }

    private func openHostApp(with url: URL) {
        // Write to App Group as fallback (in case deep link fires while app is foregrounded)
        writeToAppGroup(url: url)

        guard let scheme = Bundle.main.object(forInfoDictionaryKey: "HostAppScheme") as? String else {
            completeRequest()
            return
        }

        var components = URLComponents()
        components.scheme = scheme
        components.host = ""
        components.path = "/share"
        components.queryItems = [URLQueryItem(name: "url", value: url.absoluteString)]

        guard let deepLink = components.url else {
            completeRequest()
            return
        }

        openURL(deepLink)
        completeRequest()
    }

    @objc @discardableResult private func openURL(_ url: URL) -> Bool {
        // Method 1: Walk the responder chain to find UIApplication
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                application.open(url, options: [:], completionHandler: nil)
                return true
            }
            responder = responder?.next
        }
        // Method 2: Selector-based fallback
        let selector = NSSelectorFromString("openURL:")
        var responder2: UIResponder? = self
        while responder2 != nil {
            if responder2!.responds(to: selector) {
                responder2!.perform(selector, with: url)
                return true
            }
            responder2 = responder2?.next
        }
        return false
    }

    private func writeToAppGroup(url: URL) {
        guard
            let appGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String,
            let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup)
        else { return }

        let fileURL = containerURL.appendingPathComponent("pendingActionURL.json")
        let payload: [String: String] = ["url": url.absoluteString]
        if let data = try? JSONSerialization.data(withJSONObject: payload) {
            try? data.write(to: fileURL)
        }
    }

    private func completeRequest() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
