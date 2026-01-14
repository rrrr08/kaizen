// Performance optimization utilities for reducing main-thread work

/**
 * Defer non-critical scripts
 * Use this to load analytics, chat widgets, etc. after page load
 */
export function deferScript(src: string, onLoad?: () => void) {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.async = true;

    if (onLoad) {
        script.onload = onLoad;
    }

    // Load after page is interactive
    if (document.readyState === 'complete') {
        document.body.appendChild(script);
    } else {
        window.addEventListener('load', () => {
            document.body.appendChild(script);
        });
    }
}

/**
 * Break up long tasks into smaller chunks
 * Prevents blocking main thread for >50ms
 */
export async function yieldToMain() {
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
}

/**
 * Process array in chunks to avoid blocking
 */
export async function processInChunks<T>(
    items: T[],
    processor: (item: T) => void | Promise<void>,
    chunkSize: number = 50
) {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);

        for (const item of chunk) {
            await processor(item);
        }

        // Yield to main thread after each chunk
        await yieldToMain();
    }
}

/**
 * Idle callback wrapper
 * Run tasks when browser is idle
 */
export function runWhenIdle(callback: () => void) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
    } else {
        setTimeout(callback, 1);
    }
}

/**
 * Intersection Observer for lazy loading
 * More efficient than scroll listeners
 */
export function observeElement(
    element: Element,
    callback: () => void,
    options?: IntersectionObserverInit
) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback();
                observer.unobserve(entry.target);
            }
        });
    }, options);

    observer.observe(element);
    return observer;
}

/**
 * Measure performance
 */
export function measurePerformance(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
}

/**
 * Request Animation Frame wrapper
 * Better than setTimeout for animations
 */
export function nextFrame(callback: () => void) {
    requestAnimationFrame(() => {
        requestAnimationFrame(callback);
    });
}
