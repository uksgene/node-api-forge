// Simple retry wrapper for flaky calls.
// Inputs: async function + retry count
// Outputs: resolved value from fn or throws after retries are exhausted.
async function retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) {
            throw err;
        }

        return retry(fn, retries - 1);
    }
}

export default retry;
