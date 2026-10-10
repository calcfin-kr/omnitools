/**
 * Fix for environments where `window.fetch` is defined with only a getter on `Window` / `Window.prototype`.
 * In strict mode or modules, any script attempting `window.fetch = ...` throws:
 * "TypeError: Cannot set property fetch of #<Window> which has only a getter".
 *
 * This utility defines a writable property with both getter and setter on `window` so that assignments succeed.
 */
export function applyFetchGetterFix(): void {
  if (typeof window === "undefined") return;

  try {
    const originalFetch = window.fetch;
    let currentFetch = originalFetch ? originalFetch.bind(window) : undefined;

    // Define both getter and setter on window
    Object.defineProperty(window, "fetch", {
      get() {
        return currentFetch;
      },
      set(newFetch: typeof window.fetch) {
        currentFetch = newFetch;
      },
      configurable: true,
      enumerable: true,
    });

    // Also define on Window.prototype if configurable
    if (typeof Window !== "undefined" && Window.prototype) {
      const protoDesc = Object.getOwnPropertyDescriptor(Window.prototype, "fetch");
      if (protoDesc && protoDesc.configurable) {
        Object.defineProperty(Window.prototype, "fetch", {
          get() {
            return currentFetch;
          },
          set(newFetch: typeof window.fetch) {
            currentFetch = newFetch;
          },
          configurable: true,
          enumerable: true,
        });
      }
    }
  } catch (err) {
    // Ignore if browser prevents redefinition
  }

  // Safety net for error event listener
  try {
    window.addEventListener(
      "error",
      (event: ErrorEvent) => {
        if (
          event &&
          event.message &&
          event.message.includes("Cannot set property fetch of #<Window>")
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        }
      },
      true
    );
  } catch (_) {
    // Ignore
  }
}

// Auto-run on import
applyFetchGetterFix();
