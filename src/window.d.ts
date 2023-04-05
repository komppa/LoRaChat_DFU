declare global {
    interface Window {
        chrome?: {
            webstore?: unknown,
            runtime?: unknown
        }
    }
}

export {}