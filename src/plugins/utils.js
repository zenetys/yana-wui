/**
 * Wrapper to navigator.clipboard.writeText() with fallback tentative
 * for non-secure contexts.
 * Source: https://stackoverflow.com/a/65996386
 * Author: drmrbrewer
 */
export function copyToClipboard(textToCopy) {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        // navigator clipboard api method
        return navigator.clipboard.writeText(textToCopy);
    } else {
        // text area method
        const textArea = document.createElement('textarea');

        textArea.value = textToCopy;
        // make the textarea out of viewport
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        return new Promise((res, rej) => {
            // here the magic happens
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
        });
    }
}

/**
 * Build a route location object based on another reference route object.
 * The current $route is typically passed as reference in order to derive
 * a new route from it, overriding only some query parameters given in the
 * target route object.
 * @param {Location|undefined} target - Target route object to override
 *      the reference route object. Target route properties (name or path,
 *      parameters) get preference over the ones in the reference object.
 *      If undefined is given as target value, the resulting route will be
 *      a no-op compared to the reference one.
 * @param {Location} reference - Base route object to derive the target
 *      route object from.
 * @return {Location} - The resulting route.
 */
export function deriveRoute(target, reference) {
    var outRoute = { name: target?.name, path: target?.path, query: {}, params: {} };
    Object.assign(outRoute.query, reference.query, target?.query);
    Object.assign(outRoute.params, reference.params, target?.params);
    return outRoute;
}

/**
 * Test recursively if two values are equivalent
 *
 * This simple implementation is enought for primitive data types,
 * standard objects, arrays. Credits to Jean Vincent (uiteoi),
 * https://stackoverflow.com/a/6713782
 */
export function eq(x, y) {
    if (x === y)
        return true;
    if (!(x instanceof Object) || !(y instanceof Object))
        return false;
    if (x.constructor !== y.constructor)
        return false;
    for (let p in x) {
        if (!Object.prototype.hasOwnProperty.call(x, p))
            continue;
        if (!Object.prototype.hasOwnProperty.call(y, p))
            return false;
        if (x[p] === y[p])
            continue;
        if (typeof x[p] !== 'object')
            return false;
        if (!eq(x[p], y[p]))
            return false;
    }
    for (let p in y) {
        if (Object.prototype.hasOwnProperty.call(y, p) &&
            !Object.prototype.hasOwnProperty.call(x, p))
            return false;
    }
    return true;
}

/**
 * Generate an anchor tag with the given text and href
 * @param {string} deviceId - The id of the device
 * @param {string} label - The text to display in the anchor
 * @param {string} type - The type of the device
 * @param {object} routeObject - The base route object to use to create the route
 * @param {object} routerInstance - The router instance to use to generate the route
 * @return {string} - The generated anchor tag
 */
export function generateDeviceAnchorTag(deviceId, label, type, routeObject, routerInstance) {
    const link = getDeviceRoute(deviceId, type, routeObject, true, routerInstance);
    return ` <a href="${link}">${label}</a> `;
}

/**
 * Generate a working route or href for a device
 * @param {string} deviceId - The id of the device to generate the route for
 * @param {string} type - The type of the device
 * @param {object} routeObject - The base route object to use to create the route
 * @param {boolean} raw - If true, will return the raw url to the device, otherwise will return a complete route object
 * @param {object} routerInstance - Optional, only used if "raw", the router instance to use to resolve the url
 * @return {*} - The generated route or link
 */
export function getDeviceRoute(deviceId, type, routeObject, raw, routerInstance = null) {
    const query = routeObject.query;
    const params = { ...routeObject.params };
    params.id = deviceId;

    const deviceRoute = {
        name: type === 'switch' ? 'ViewSwitch' : 'ViewHost',
        params,
        query,
    };

    if (raw) {
        return routerInstance.resolve(deviceRoute).href;
    } else {
        return deviceRoute;
    }
}

/**
 * Generate an updated API URL for fetching ata
 * @param {object} stateParams - The state params to use to generate the URL
 * @param {string} type - The type of the data to fetch
 * @return {string} - The generated API URL
 */
export function getUpdatedApiUrl(stateParams, type) {
    let url = '';
    const search = stateParams.search || '';

    if (stateParams.entity && stateParams.database) {
        url += '/entity/' + encodeURIComponent(stateParams.entity);

        switch (type) {
            case 'fdb':
                url += '/fdb?q=' + encodeURIComponent(search);
                break;
            case 'devices':
                url += '/devices?q=' + encodeURIComponent(search) + '&short';
                break;
            case 'device':
                url += '/devices?id=' + encodeURIComponent(stateParams.id);
                break;
            case 'interface':
                url += '/interfaces?id=' + encodeURIComponent(stateParams.id);
                break;
            case 'vlans':
                url += '/vlans?';
                break;
        }

        url += '&database=' + encodeURIComponent(stateParams.database);
    }

    return url;
}

/**
 * Check if an object is empty or not
 * @param {object} object - The object to check
 * @return {boolean} - True if the object is empty, false otherwise
 */
export function isEmptyObject(object) {
    return Object.keys(object).length === 0;
}

/**
 * Test if a value is a "plain object", as created by the {} object
 * literal or with new Object(). Note this returns false for objects
 * created with a null prototype like Object.create(null).
 *
 * @param {*} value - The value to test.
 * @return {boolean} - True is the given value is a "plain object",
 *      false otherwise.
 */
export function isPlainObject(value) {
    return !!value && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Transform an input that can be an array into a litteral value
 * If it's an array, return the first value of the array
 * @param {any} input - The value to check
 * @return {any}
 */
export function unArray(input) {
    return Array.isArray(input) ? input[0] : input;
}
