export { }
declare global {
    interface Window {
        gtag: (...args: Gtag[]) => void
    }
}

declare const window: Window
