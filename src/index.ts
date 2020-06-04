/**
 * ## Externally accessible entries
 *
 * r2epub can be used as a library module both for TypeScript and for Javascript. The external entities are listed below; see their respective documentations for further information.
 *
 * The top level functional entry point to the package is [[convert]].
 *
 * @packageDocumentation
*/

/**
 *
 *
 */

import * as constants  from './lib/constants';
import * as ocf        from './lib/ocf';
import * as rConvert   from './lib/convert';
import * as cConvert   from './clib/convert';
import * as fetch      from './lib/fetch';
import * as _          from 'underscore';


/**
 * Convenience class, to export the [[rConvert.RespecToEPUB]] class for the package as a whole.
 * (This is only useful of, for some reasons, the conversion is done from a DOM tree level. Otherwise [[convert]] should be used)
 */
export class RespecToEPUB  extends rConvert.RespecToEPUB {};

/**
 * Convenience class, to export the [[ocf.OCF]] class for the package as a whole; conversion methods or functions return an instance of this class, containing the generated EPUB content.
 */
export class OCF extends ocf.OCF {};


/**
 * Config options, to be used as part of the input arguments in [[Arguments]] to overwrite the `config` options of ReSpec. See [[Options]] for details.
 */
interface ConfigOptions {
    [x :string] :string
}

/**
 * Options provided by the user if and when the source has to be pre-processed via ReSpec.
 *
 * The original content file has to be run through the W3C [spec generator service](https://labs.w3.org/spec-generator/)
 * before further processing to convert the ReSpec source first. If that is the case (see [[Options.respec]]), it is also possible to set some of the ReSpec configuration options,
 * overwriting the values set in the `config` entry of the original file. The possible ReSpec options to be set are `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel`.
 * See the [ReSpec editor's guide](https://github.com/w3c/respec/wiki/ReSpec-Editor's-Guide) for details.
 *
 */
export interface Options {
    /**
     * Is the source in ReSpec?
     */
    respec?  :boolean,
    /**
     * Collection of respec config options, to be used with the spec generator (if applicable).
     */
    config? :ConfigOptions
}

/**
 * Return an [[Options]] instance with all defaults filled in.
 *
 * @param options
 */
const fill_default_options = (options: Options) :Options => {
    const defaultConfig :ConfigOptions = {
        publishDate     : null,
        specStatus      : null,
        addSectionLinks : null,
        maxTocLevel     : null
    }
    return {
        respec : options.respec === undefined || options.respec === null ? false : options.respec,
        config : _.defaults(options.config, defaultConfig)
    };
}

/**
 * The top level entry in the package: convert a single Respec file, or a collection thereof, into an EPUB document.
 *
 * @async
 * @param url the URL of either the HTML content (if the target is a single document) or a JSON content (if the target is a collection of HTML documents)
 * @param options ReSpec options in case the source has to be preprocessed by ReSpec
 * @param t whether tracing is set (for debugging)
 * @param p whether the package stops at the creation of an EPUB content and displays the content of the OPF file itself (for debugging)
 */
export async function convert(url: string, options: Options = {}, t :boolean = false, p :boolean = false) :Promise<OCF> {
    // At the minimum, the URL part of the Arguments should exist, better check this
    if (url) {
        // If the URL refers to a JSON file, it is the configuration file for a full collection.
        let the_ocf :ocf.OCF;
        const media_type :string = await fetch.fetch_type(url);
        if (media_type === constants.media_types.json) {
            the_ocf = await cConvert.create_epub(url, t, p);
        } else {
           the_ocf = await (new rConvert.RespecToEPUB(t, p)).create_epub(url, fill_default_options(options));
        }
        return the_ocf;
    } else {
        throw "No URL has been provided for the conversion"
    }
}

