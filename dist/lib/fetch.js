"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch = __importStar(require("node-fetch"));
const urlHandler = __importStar(require("url"));
const validUrl = __importStar(require("valid-url"));
const jsdom = __importStar(require("jsdom"));
/** Media type for JSON
 * @hidden
*/
const json_media_type = 'application/json';
/** Media type for JSON-LD
 * @hidden
*/
const jsonld_media_type = 'application/ld+json';
/** Media type for HTML
 * @hidden
*/
const html_media_type = 'text/html';
/** Media type for XHTML
 * @hidden
*/
exports.xhtml_media_type = 'application/xhtml+xml';
/** Media type for CSS
 * @hidden
*/
exports.css_media_type = 'text/css';
/** Media type for SVG
 * @hidden
*/
exports.svg_media_type = 'image/svg+xml';
/** Media type for javascript
 * @hidden
*/
exports.js_media_type = 'text/javascript';
/** Media type for ecmascript
 * @hidden
*/
exports.es_media_type = 'text/ecmascript';
/** Media type for PNG image
 * @hidden
 */
exports.png_media_type = 'image/png';
/** These media types refer to textual content, no reason to bother about streaming... */
const text_content = [
    json_media_type,
    jsonld_media_type,
    html_media_type,
    exports.xhtml_media_type,
    exports.css_media_type,
    exports.svg_media_type,
    exports.js_media_type,
    exports.es_media_type
];
/**
* Basic sanity check on a URL supposed to be used to retrieve a Web Resource.
*
* The function returns a (possibly slightly modified) version of the URL if everything is fine, or a null value if
* the input argument is not a URL (but should be used as a filename).
*
* There might be errors, however, in the case it is a URL.
*
* The checks are as follows:
*
* 1. Check whether the protocol is http(s). Other protocols are not accepted (actually rejected by fetch, too);
* 2. Run the URL through a valid-url check, which looks at the validity of the URL in terms of characters used, for example;
* 3. Check that the port (if specified) is in the allowed range, i.e., > 1024;
*
* @param address
* @returns  - the URL itself (which might be slightly improved by the valid-url method) or `null` if this is, in fact, not a URL
* @throws  if `address` pretends to be a URL, but it is not acceptable for some reasons.
*/
const check_Web_url = (address) => {
    const parsed = urlHandler.parse(address);
    if (parsed.protocol === null) {
        // This is not a URL, should be used as a file name
        throw new Error(`"${address}": Invalid URL: no protocol`);
    }
    // Check whether we use the right protocol
    if (['http:', 'https:'].includes(parsed.protocol) === false) {
        throw new Error(`"${address}": URL is not dereferencable`);
    }
    // Run through the URL validator
    const retval = validUrl.isWebUri(address);
    if (retval === undefined) {
        throw new Error(`"${address}": the URL isn't valid`);
    }
    // Check the port
    if (parsed.port !== null) {
        try {
            const portNumber = Number(parsed.port);
            if (portNumber <= 1024) {
                throw new Error(`"${address}": Unsafe port number used in URL (${parsed.port})`);
            }
        }
        catch (e) {
            throw new Error(`"${address}": Invalid port number used in URL (${parsed.port})`);
        }
    }
    // If we got this far, this is a proper URL, ready to be used.
    return retval;
};
/**
 * The effective fetch implementation run by the rest of the code.
 *
 * There is no default fetch implementation for `node.js`, hence the necessity to import 'node-fetch'. However, if the code
 * runs in a browser, there is an error message whereby only the fetch implementation in the Window is acceptable.
 *
 * This variable is a simple, polyfill like switch between the two, relying on the existence (or not) of the
 * `process` variable (built-in for `node.js`).
 *
 * I guess this makes this entry a bit polyfill like:-)
 */
const my_fetch = (process !== undefined) ? node_fetch.default : fetch;
/**
 * Fetch a resource.
 *
 * @param resource_url
 * @param force_text - whether the resource should be returned as text in case no content type is set by the server
 * @returns - resource; either a simple text, or a Stream
 * @async
 */
async function fetch_resource(resource_url, force_text = false) {
    // If there is a problem, an exception is raised
    return new Promise((resolve, reject) => {
        try {
            // This is a real URL, whose content must be accessed via HTTP(S)
            // An exception is raised if the URL has security/sanity issues.
            const final_url = check_Web_url(resource_url);
            my_fetch(final_url)
                .then((response) => {
                if (response.ok) {
                    // If the response content type is set (which is usually the case, but not in all cases...)
                    const response_type = response.headers.get('content-type');
                    if (response_type && response_type !== '') {
                        if (text_content.includes(response_type)) {
                            // the simple way, just return text...
                            resolve(response.text());
                        }
                        else {
                            if (force_text) {
                                resolve(response.text());
                            }
                            else {
                                // return the body without processing, ie, as a stream
                                resolve(response.body);
                            }
                        }
                    }
                    else {
                        // No type information on return, let us hope this is something proper
                        // TODO: (in case of a full implementation) to do something intelligent if there is no response header content type.
                        resolve(response.text());
                    }
                }
                else {
                    reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
                }
            })
                .catch((err) => {
                reject(new Error(`Problem accessing ${resource_url}: ${err}`));
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.fetch_resource = fetch_resource;
/**
 * Fetch the media type of the resource.
 *
 * @param resource_url
 * @returns - the media type
 * @async
 */
async function fetch_type(resource_url) {
    // If there is a problem, an exception is raised
    return new Promise((resolve, reject) => {
        try {
            // This is a real URL, whose content must be accessed via HTTP(S)
            // An exception is raised if the URL has security/sanity issues.
            const final_url = check_Web_url(resource_url);
            my_fetch(final_url)
                .then((response) => {
                if (response.ok) {
                    // If the response content type is set (which is usually the case, but not in all cases...)
                    resolve(response.headers.get('content-type'));
                }
                else {
                    reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
                }
            })
                .catch((err) => {
                reject(new Error(`Problem accessing ${resource_url}: ${err}`));
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.fetch_type = fetch_type;
/**
 * Fetch an HTML file via [[fetch_resource]] and parse the result into a DOM instance.
 *
 * @async
 * @param html_url
 * @return - DOM object for the parsed HTML
 * @throws Error if something goes wrong with fetch or DOM Parsing
 */
async function fetch_html(html_url) {
    try {
        const body = await fetch_resource(html_url, true);
        const retval = new jsdom.JSDOM(body, { url: html_url });
        return retval;
    }
    catch (err) {
        throw new Error(`HTML parsing error in ${html_url}: ${err}`);
    }
}
exports.fetch_html = fetch_html;
//# sourceMappingURL=fetch.js.map