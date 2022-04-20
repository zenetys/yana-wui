/**
 * Get the longest string value of an array.
 *
 * For convenience, if the input is not an array, the given value is
 * returned straight.
 *
 * @returns {string} - Longest string value in the array.
 */
export function arrayLongest(input) {
    if (!Array.isArray(input))
        return input;
    /* sort by string length descending, return the first */
    const cmp = (a, b) => a.length == b.length
        ? 0 : (a.length < b.length ? 1 : -1);
    return input.map((e) => String(e).replace(/\r/g, ''))
                .sort(cmp)[0];
}

/**
 * Wrapper to navigator.clipboard.writeText() with fallback tentative
 * for non-secure contexts.
 * Source: https://stackoverflow.com/a/65996386
 * Author: drmrbrewer
 */
export function copyToClipboard(textToCopy) {
    /* navigator clipboard api needs an https secure context */
    if (navigator.clipboard && window.isSecureContext)
        return navigator.clipboard.writeText(textToCopy);

    /* fallback to text area method */
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
        document.execCommand('copy') ? res() : rej();
        textArea.remove();
    });
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
 * Simple date formatting helper, producing rfc3339 format by default.
 * @param {Date|string|number} input - Input date, suitable to be passed to
 *      the Date constructor
 * @param {object} [options] - Formatting options
 * @param {boolean} [options.tzOffset=true] - Include timezone
 * @param {string} [options.tzSeparator=''] - Separator before timezone
 * @param {string} [options.timeSeparator='T'] - Separator before time
 * @param {boolean} [options.milliseconds=true] - Include milliseconds
 * @return {string} Date formatted according to the given options
 */
export function formatDate(input, options) {
    const defaultOptions = {
        tzOffset: true,
        tzSeparator: '',
        timeSeparator: 'T',
        milliseconds: true,
    };
    options = Object.assign({}, defaultOptions, options);
    let now = new Date(input);
    let out = now.getFullYear() +
        '-' + (now.getMonth() + 1).toString().padStart(2, '0') +
        '-' + now.getDate().toString().padStart(2, '0') +
        options.timeSeparator + now.getHours().toString().padStart(2, '0') +
        ':' + now.getMinutes().toString().padStart(2, '0') +
        ':' + now.getSeconds().toString().padStart(2, '0');
    if (options.milliseconds)
        out += '.' + now.getMilliseconds().toString().padStart(3, '0');

    if (options.tzOffset) {
        let tzOffset = now.getTimezoneOffset() * -1;
        out += options.tzSeparator;
        if (tzOffset == 0)
            out += 'Z'
        else {
            let tzOffsetHours = Math.floor(tzOffset / 60);
            let tzOffsetMinutes = tzOffset % 60;
            out += (tzOffset >= 0 ? '+' : '-') +
                tzOffsetHours.toString().padStart(2, '0') + ':' +
                tzOffsetMinutes.toString().padStart(2, '0');
        }
    }
    return out;
}

/**
 * Duration formatting helper.
 * @param {number} s - Number of seconds
 * @return {string} Duration formatted as a number of days (d), hours (h),
 *      minutes (m) and seconds (s)
 */
export function formatDuration(s /* seconds */) {
    s = Math.round(s);
    var d = Math.floor(s/86400);
    s = s - d*86400;
    var h = Math.floor(s/3600);
    s = s - h*3600;
    var m = Math.floor(s/60);
    s = s - m*60;

    if (m == 0 && h == 0 && d == 0)
        return s.toString().padStart(2, '0') + 's';
    else if (h == 0 && d == 0)
        return m.toString().padStart(2, '0') + 'm ' +
               s.toString().padStart(2, '0') + 's';
    else if (d == 0)
        return h.toString().padStart(2, '0') + 'h ' +
               m.toString().padStart(2, '0') + 'm';
    else
        return d.toString() + 'd ' +
               h.toString().padStart(2, '0') + 'h';
}

/**
 * Format a number with kilo (K), mega (M), ... unit prefix.
 * @param {number|string} input - Input value, suitable for Number()
 * @param {number} mult - Prefix factor, use 1024 for bytes, 1000 otherwise
 * @param {string} separator - Separator beteen value and unit prefix
 * @return {string} The number formatted accordingly to the given options
 */
export function formatNumber(input, mult, separator) {
    /* accept number as string */
    input = Number(input);
    if (isNaN(input))
        return 'NaN';
    const humanSymbols = [ '', 'K', 'M', 'G', 'T' ];
    let symbolIndex = 0;
    while (input >= mult && symbolIndex < humanSymbols.length) {
        symbolIndex++;
        input /= mult;
    }
    return input.toFixed(2) + separator + humanSymbols[symbolIndex];
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
 * Simplification and normalization of a device name.
 * @param {string} name - Raw device name
 * @return {string} Simplified and normalized representation of the given
 *      device name, NOT collision free, but good enough (at least for now) to
 *      join data from various sources using a (short) hostname as key.
 */
export function simplifyDeviceName(name) {
    return stripDomain(name).toLowerCase();
}

/**
 * Get the hostname part of a fully qualified domain name. In other words,
 * strip the domain part of an hostname.
 * @param {string} name - Device name, with or without FQDN
 * @return {string} Hostname part of the given name, domain stripped
 */
export function stripDomain(name) {
    var dot = name.indexOf('.');
    if (dot > 0) /* use 0 instead of -1, so we do not make an empty name */
        return name.substr(0, dot);
    return name;
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
