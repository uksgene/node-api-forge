async function retry(fn, retries = 3) {

    try {
        return await fn();
    } catch (err) {

        if (retries === 0) throw err;

        return retry(fn, retries - 1);
    }

}

module.exports = retry;
