#! /usr/local/bin/node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main CLI entry point to the ReSpec to EPUB 3.2 conversion.
 * @packageDocumentation
 */
/* Main imports */
const process_1 = require("./lib/process");
/** @hidden */
const yargs = require("yargs");
/**
 * CLI to the ReSpec to EPUB 3.2 conversion. The usage of the entry point is:
 *
 * ```txt
 * Options:
 *  --help                 Show help  [boolean]
 *  -r, --respec           The source is in respec [boolean] [default: false]
 *  -d, --publishDate      Publication date [string] [default: null]
 *  -s, --specStatus       Specification type [string] [default: null]
 *  -l, --addSectionLinks  Add section links with "§" [string] [default: null]
 *  -m, --maxTocLevel      Max TOC level [number] [default: null]
 *  --version              Show version number  [boolean]
 * ```
 *
 * For the `-d`, `-s`, `-l`, or `-m` flags, see the [ReSpec manual](https://www.w3.org/respec/). These flags are only operational if the `-r` flag is also set.
 *
 * This function is a wrapper around [[create_epub]].
 *
 * ### Usage examples:
 *
 * Convert the HTML file (as generated by ReSpec) to an EPUB 3.2 file. The generated publication's name is `short-name.epub`, where `short-name` is set in the ReSpec configuration:
 *
 * > `main.js https://www.example.org/doc.html`
 *
 * Convert the HTML _ReSpec source_ to an EPUB 3.2 file. The source is converted on-the-fly by respec:
 *
 * > `main.js -r https://www.example.org/index.html`
 *
 * Convert the HTML _ReSpec source_ to an EPUB 3.2 file, setting its spec status to REC. The source is converted on-the-fly by respec, overwriting the `specStatus` entry in the configuration to `REC`:
 *
 * > `main.js -r --specStatus REC https://www.example.org/index.html`
 *
 * @async
 */
async function main() {
    const argv = yargs.options({
        r: { type: 'boolean', alias: 'respec', default: false, description: 'The source is in respec' },
        p: { type: 'boolean', alias: 'package', default: false, description: '[Debug] Do not generate an EPUB file, just print the package file content' },
        t: { type: 'boolean', alias: 'trace', default: false, description: '[Debug] Print built in trace information' },
        d: { type: 'string', alias: 'publishDate', default: null, description: 'Publication date' },
        s: { type: 'string', alias: 'specStatus', default: null, description: 'Specification type' },
        l: { type: 'string', alias: 'addSectionLinks', default: null, description: 'Add section links with "§"' },
        m: { type: 'number', alias: 'maxTocLevel', default: null, description: 'Max TOC level' }
    })
        .version()
        .wrap(null)
        .argv;
    const args = {
        url: argv._.length === 0 ? 'http://localhost:8001/TR/vc-data-model/' : argv._[0],
        respec: argv.r,
        package: argv.p,
        trace: argv.t,
        config: {
            publishDate: argv.d,
            specStatus: argv.s,
            addSectionLinks: argv.l,
            maxTocLevel: argv.m
        }
    };
    try {
        await process_1.create_epub(args);
    }
    catch (e) {
        console.error(`EPUB Generation error: "${e}"`);
    }
}
main();
//# sourceMappingURL=main.js.map