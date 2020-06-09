"use strict";
/**
 * ## Externally accessible entries
 *
 * r2epub can be used as a library module both to TypeScript and to Javascript. The externally visible entities are listed below; see their respective documentations for further information.
 *
 * The top level functional entry point to the package is [[convert]].
 *
 * @packageDocumentation
*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 */
const constants = __importStar(require("./lib/constants"));
const ocf = __importStar(require("./lib/ocf"));
const rConvert = __importStar(require("./lib/convert"));
const cConvert = __importStar(require("./clib/convert"));
const fetch = __importStar(require("./lib/fetch"));
const _ = __importStar(require("underscore"));
/**
 * Convenience class, to export the internal [RespecToEPUB](_lib_convert_.respectoepub.html) class for the package as a whole.
 * (This is only useful if, for some reasons, the conversion is done starting with a DOM tree, using [create_epub_from_dom](_lib_convert_.respectoepub.html#create_epub_from_dom). In general, [[convert]] should be used)
 */
class RespecToEPUB extends rConvert.RespecToEPUB {
}
exports.RespecToEPUB = RespecToEPUB;
;
/**
 * Convenience class to export the internal [OCF](_lib_ocf_.ocf.html) class for the package as a whole. Conversion methods or functions return an instance of this class, containing the generated EPUB content.
 */
class OCF extends ocf.OCF {
}
exports.OCF = OCF;
;
/**
 * The top level entry in the package: convert a single Respec file, or a collection thereof, into an EPUB document.
 *
 * @async
 * @param url the URL of either the HTML content (if the target is a single document) or a JSON content (if the target is a collection of HTML documents)
 * @param options ReSpec options in case the source has to be preprocessed by ReSpec
 * @param t whether tracing is set (for debugging)
 * @param p whether the package stops at the creation of an EPUB content and displays the content of the OPF file itself (for debugging)
 */
async function convert(url, options = {}, t = false, p = false) {
    /*
     * Return an [[Options]] instance with all defaults filled in.
     *
     */
    const fill_default_options = (options) => {
        const defaultConfig = {
            publishDate: null,
            specStatus: null,
            addSectionLinks: null,
            maxTocLevel: null
        };
        return {
            respec: options.respec === undefined || options.respec === null ? false : options.respec,
            config: _.defaults(options.config, defaultConfig)
        };
    };
    // At the minimum, the URL part of the Arguments should exist, better check this
    if (url) {
        // If the URL refers to a JSON file, it is the configuration file for a full collection.
        let the_ocf;
        const media_type = await fetch.fetch_type(url);
        if (media_type === constants.media_types.json) {
            the_ocf = await cConvert.create_epub(url, t, p);
        }
        else {
            the_ocf = await (new rConvert.RespecToEPUB(t, p)).create_epub(url, fill_default_options(options));
        }
        return the_ocf;
    }
    else {
        throw "No URL has been provided for the conversion";
    }
}
exports.convert = convert;
//# sourceMappingURL=index.js.map