/**
 * ## Collection Configuration
 *
 * The JSON Collection Configuration file is defined as follows:
 *
 * ``` json
 * {
 *    "title"    : "Title of the collection",
 *    "name"     : "Used as the base file name of the final document",
 *    "comment"  : "Comment on the collection configuration",
 *    "chapters" : [{
 *        "url"    : "URL of the first chapter"
 *        "respec" : "whether the document must be pre-processed by ReSpec [boolean]",
 *        "config" : {
 *            "publishDate     : "[iso date format]",
 *            "specStatus      : "...",
 *            "addSectionLinks : "[boolean]",
 *            "maxTocLevel     : "[number]"
 *        }
 *    },{
 *        ...
 *    }]
 * }
 * ```
 *
 * For the meaning of the configuration options, see the [ReSpec manual](https://www.w3.org/respec/). The "title", "name", "chapters", and "url" fields are required, all others are optional. The value of "comment" is ignored by the module.
 *
 * The JSON collection configuration file is checked against the JSON [schema](https://github.com/iherman/src/clib/r2epub.schema.json) in the [[get_book_configuration]] function.
 *
 * @packageDocumentation
 */

/**
 *
 */
import Ajv           from 'ajv';
import * as cConvert from './convert';
import conf_schema   from './r2epub.schema.json';

/**
 * Validates the input JSON configuration using the JSON schema, and converts the result to the internal data structure.
 *
 * @param data
 * @throws invalid schema, or schema validation error on the data
 */
export function get_book_configuration(data :any) :cConvert.CollectionConfiguration {
    const ajv = new Ajv({
        "allErrors" : true,
    });
    const validator = ajv.compile(conf_schema);
    const valid = validator(data);
    if (!valid) {
        throw `Schema validation error on the collection configuration file: \n${JSON.stringify(validator.errors,null,4)}\nValidation schema: https://github.com/iherman/r2epub/src/clib/r2epub.schema.json`
    } else {
        const chapters :cConvert.ChapterConfiguration[] = data.chapters.map((chapter :any) :cConvert.ChapterConfiguration => {
            const config :any = {};
            if (chapter.config !== undefined) {
                if (chapter.config.specStatus !== undefined)      config.specStatus      = chapter.config.specStatus;
                if (chapter.config.publishDate !== undefined)     config.publishDate     = chapter.config.publishDate;
                if (chapter.config.addSectionLinks !== undefined) config.addSectionLinks = `${chapter.config.addSectionLinks}`;
                if (chapter.config.maxTocLevel !== undefined)     config.maxTocLevel     = `${chapter.config.maxTocLevel}`;
            }

            return {
                url    : chapter.url,
                respec : (chapter.respec === undefined) ? false : chapter.respec,
                config : config
            }
        });

        return {
            title    : data.title,
            name     : data.name,
            chapters : chapters
        };
    }
}