/**
 * return a debounced version of given function.
 * It will call the function immediately only if the delay is passed since the last call.
 * If the delay is not passed, it will wait for the delay to pass before calling the function.
 * If the function is called multiple times during the delay since last execution, 
 * it will only call the function once with the last arguments.
 * function will return a promise of resolution which will be aborted if the function is called again before the delay.
 * you should check for AbortError in your catch block, or add an unhandledrejection event listener.
 * 
 * @param {Function} fn 
 * @param {number} [delay=250]
 * @returns 
 */
export const debounced = (fn, delay = 250) => {
  let lastExec = 0
  let cancelPreviousCall = null
  return async (/**@type {any[]} */...args) => {
    cancelPreviousCall?.() // cancel any pending call
    cancelPreviousCall = null
    const controller = new AbortController()
    const signal = controller.signal
    const now = Date.now()
    const elapsed = now - lastExec
    return new Promise((resolve, reject) => {
      const run = async () => {
        if (signal.aborted) {
          return reject(signal.reason)
        }
        lastExec = Date.now()
        try {
          const res = await fn(...args)
          resolve(res)
        } catch (error) {
          reject(error)
        }
      }
      if (elapsed > delay) {
        run()
      } else {
        const timer = setTimeout(run, delay - elapsed)
        signal.addEventListener("abort", () => {
          clearTimeout(timer)
          reject(signal.reason)
        })
        cancelPreviousCall = () => controller.abort(new DOMException("Debounced", "AbortError"))
      }
    })
  }
}