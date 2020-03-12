/**
 * Main processing steps for the creation of EPUB files. See [[process]] for the details.
 */

import * as jsdom      from 'jsdom';
import * as _          from 'underscore';
import * as urlHandler from 'url';

import { fetch_html, fetch_resource, fetch_type, xhtml_media_type, URL } from './fetch';
import { PackageWrapper } from './package';
import * as css           from './css';
import * as cover         from './cover';
import * as nav           from './nav';
import { OCF }            from './ocf';
import * as create_xhtml  from './create_xhtml';


/**
 * Interface for the resources that, eventually, should be added to the EPUB file
 */
export interface ResourceRef {
    /** The URL to be used within the EPUB; relative to the top of the file */
    relative_url   :URL,

    /** Media type of the resource; this must be added to the package manifest entry */
    media_type     :string,

    /** URL of the resource in case it must be fetched */
    absolute_url?  :URL,

    /** Content of the resource in case it is generated by this program */
    text_content?  :string,

    /** The item must have a fixed id, rather than a generated one */
    id?            :string,

    /** Extra properties, defined by the package specification, to be added to the entry */
    properties?    :string
}


/** Interface of the "Global" data, to be used by various utilities */
export interface Global {
    /** The URL of the document to be processed */
    document_url? :string,

    /** The DOM element, as returned from parsing */
    dom?          : jsdom.JSDOM,

    /** The DOM HTML element of the main document */
    html_element? :Element,

    /**
     * The  initial config object, originally filled by the user (respec puts a copy of this
     * object, as JSON, into the header of the generated content.
    */
    config?       :any,

    /**
     * The class used for the generation of the EPUB opf file
     */
    package?      :PackageWrapper

    /**
     * List of extra resources, to be added to the opf file and into the final EPUB file
     */
    resources?    :ResourceRef[]
}

/**
 * Interface for the HTML DOM elements, to be considered for possible internal references.
 */
interface LocalLinks {
    /** CSS selector to locate the right DOM elements */
    query :string,
    /** Attribute name to extract the resource URL */
    attr  :string
}

/**
 * Arrays of query/attribute pairs that may refer to a resource to be collected:
 *
 * - image elements
 * - `a` elements
 * - links to stylesheets
 * - `object` elements
 */
const resource_references :LocalLinks[] = [
    {
        query : 'img',
        attr  : 'src'
    },
    {
        query : 'a',
        attr  : 'href'
    },
    {
        query : 'link[rel="stylesheet"]',
        attr  : 'href'
    },
    {
        query : 'object',
        attr  : 'data'
    }
]

/**
 * Main processing steps:
 *
 * 1. Gather all the global information ([[Global]])
 * 2. Add the basic metadata (authors, dates) to the opf file
 * 3. Collect all the resources (see [[resource_references]]); the relative urls and the media types are all
 * added to [[global]], to be added to the EPUB file and the opf file later
 * 4. Add the reference to the W3C logo
 * 5. Add some of the global W3C CSS files, and auxillary image files
 * 6. Create a cover file
 * 7. Create a nav file
 * 8. Finalize the package file
 * 9. Download all resources into the EPUB file
 *
 * @param document_url - The URL for the (generated) file
 * @async
 */
export async function process(document_url: string) {

    // ------------------------------------------
    // 1. Get hold of the local information
    const global :Global = {
        document_url : document_url,
        resources : []
    }

    {
        // get hold of the document as a DOM node.
        global.dom          = await fetch_html(document_url);
        global.html_element = global.dom.window.document.documentElement;
    }

    {
        // Get hold of the configuration information
        const initial_config_element = global.html_element.querySelector("script#initialUserConfig") as HTMLScriptElement;
        if( initial_config_element === null ) {
            throw "User config is not available"
        } else {
            global.config = JSON.parse(initial_config_element.textContent);
        }
    }

    // ------------------------------------------
    // 2. Add the basic metadata (authors, dates) to the opf file
    {
        // Create the package content, and populate it with the essential metadata using the configuration
        const title = global.html_element.querySelector('title').textContent;
        const identifier = `https://www.w3.org/TR/${global.config.shortName}/`;
        global.package = new PackageWrapper(identifier, title);
        global.package.add_creators(global.config.editors.map((entry: any) => `${entry.name}, ${entry.company}`));

        const date = global.html_element.querySelector('time.dt-published');
        global.package.add_dates(date.getAttribute('datetime'));
    }

    // ------------------------------------------
    // 3. Collect all the resources
    global.resources = await get_extra_resources(global);


    // ------------------------------------------
    // 4. Add the reference to the W3C logo
    {
        const logo_element = global.html_element.querySelector('img[alt="W3C"]');
        if (logo_element !== null) {
            const relative_url = 'StyleSheets/TR/2016/logos/W3C.svg';
            logo_element.setAttribute('src', relative_url);
            global.resources.push({
                relative_url : relative_url,
                media_type   : 'image/svg+xml',
                absolute_url : 'https://www.w3.org/StyleSheets/TR/2016/logos/W3C'
            })
        }
    }

    // ------------------------------------------
    // 5. Add some of the global W3C CSS files, and auxillary image files
    global.resources = [...global.resources, ...css.extract(global)]

    // ------------------------------------------
    // 6. Create a cover file
    global.resources = [...cover.create_cover_page(global), ...global.resources, ];

    // ------------------------------------------
    // 7. Create a nav file
    global.resources = [...nav.create_nav_file(global), ...global.resources];

    // ------------------------------------------
    // 8. Finalize the package file
    {
        // Populate the global package with the additional resources
        let res_id_num = 1;
        global.resources.forEach((resource) => {
            if (resource.relative_url) {
                global.package.add_manifest_item({
                    "@href"       : resource.relative_url,
                    "@media-type" : resource.media_type,
                    "@id"         : resource.id || `res_id${res_id_num}`,
                    "@properties" : resource.properties
                });
                res_id_num++;
            }
         })
    }

    // console.log(global.package.serialize())
    // 9. Download all resources into the EPUB file
    await generate_epub(global, `${global.config.shortName}.epub`);
 }


/**
 * Collect the references to the extra resources, to be added to the EPUB file as well as the package opf file.
 * It relies on searching through the HTML source file, based on the query patterns given in [[resource_references]].
 *
 * @param global - global data
 * @returns - list of additional resources
 * @async
 */
const get_extra_resources = async (global: Global): Promise<ResourceRef[]> => {
    // Collect the set of resources from relative links in the source
    // The 'resource_references' array gives the pair of CSS query and attribute names to consider as
    // local resources. Those are collected in one array.
    const target_urls = _.chain(resource_references)
        // extract the possible references
        .map((ref :LocalLinks) => {
            const candidates = Array.from(global.html_element.querySelectorAll(ref.query));
            return candidates.map((element) => element.getAttribute(ref.attr));
        })
        // create one single array of the result (instead of an array or arrays)
        .flatten()
        // Remove absolute URL-s
        .filter((ref) => {
            if (ref !== '' && ref !== null) {
                const parsed = urlHandler.parse(ref);
                // Relative URL means that the protocol is null
                return parsed.protocol === null && parsed.path !== null;
            } else {
                return false;
            }
        })
        // Remove fragment part, if any
        .map((ref) => {
            const parsed = urlHandler.parse(ref);
            parsed.hash = null;
            return urlHandler.format(parsed);

        })
        .value();

    // Ensure that the list is duplicate free
    // (Why couldn't I put this into the chain???)
    const relative_urls = _.uniq(target_urls);
    const absolute_urls = relative_urls.map((ref :string) :string => urlHandler.resolve(global.document_url, ref));
    const media_types   = await Promise.all(absolute_urls.map((url) => fetch_type(url)));

    return _.zip(relative_urls, media_types, absolute_urls).map((entry: string[]) :ResourceRef => {
        return {
            relative_url : entry[0],
            media_type   : entry[1],
            absolute_url : entry[2],
        }
    });
}


const generate_epub = async (global: Global, epub_file_name: string) => {
    const the_book = new OCF(epub_file_name);

    // The OCF class adds the fixed file like mime type and such automatically.
    // Add the package to the archives, with a fixed name:
    the_book.append(global.package.serialize(),'package.opf');

    // Add the core file as 'Overview.xhtml'
    the_book.append(create_xhtml.convert_dom(global.dom),'Overview.xhtml');

    // Add the cover page
    // Add the TOC page
    // Add all the resources
    {
        // First, find the resources where the content is simply a text; this can be archived directly
        global.resources
            .filter((resource: ResourceRef): boolean => resource.text_content ? true : false)
            .forEach((resource: ResourceRef): void => the_book.append(resource.text_content, resource.relative_url));

        // Second, find the resources where the content must be fetched...
        const to_be_fetched = global.resources.filter((resource: ResourceRef): boolean => resource.absolute_url ? true : false);
        const file_names = to_be_fetched.map((resource :ResourceRef): URL => resource.relative_url);
        const urls       = to_be_fetched.map((resource :ResourceRef): URL => resource.absolute_url);
        const contents   = await Promise.all(urls.map((url: URL): Promise<any> => fetch_resource(url)));
        _.zip(contents, file_names).forEach((arg: [any,string]) :void => the_book.append(arg[0], arg[1]));
    }

    await the_book.finalize();
}
