// Visible-only, non-overlapping, bounded adaptive polling. No private persistent storage.
export function synchronize(read, apply, { interval = 12000, onError = () => { } } = {}) {
    let stopped = false, timer = null, delay = interval, inflight = false, last = null;
    async function tick() {
        if (stopped || document.hidden || !navigator.onLine)
            return;
        if (inflight)
            return;
        inflight = true;
        try {
            const value = await read();
            if (stopped)
                return;
            const fingerprint = JSON.stringify(value);
            if (fingerprint !== last) {
                last = fingerprint;
                await apply(value);
            }
            delay = interval;
        }
        catch (error) {
            delay = Math.min(delay * 2, 120000);
            if (!stopped)
                onError(error);
        }
        finally {
            inflight = false;
            if (!stopped)
                timer = setTimeout(tick, delay);
        }
    }
    timer = setTimeout(tick, interval);
    return () => { stopped = true; clearTimeout(timer); };
}
