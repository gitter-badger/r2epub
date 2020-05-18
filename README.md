# ReSpec to EPUB

Typescript program to convert W3C documents, produced by [ReSpec](https://github.com/w3c/respec), to EPUB 3.2.

If used from another program, the main entry point are the [create_epub](https://iherman.github.io/r2epub/typedoc/classes/_lib_convert_.respectoepub.html#create_epub) and [create_epub_from_dom](https://iherman.github.io/r2epub/typedoc/classes/_lib_convert_.respectoepub.html#create_epub_from_dom) methods in the [“process” module](modules/_lib_process_.html), which create the EPUB 3.2 file by submitting a URL and some flags, or the URL and a DOM instance, respectively.

## Package usage

### Command line usage

There is a simple CLI implemented in [cli](https://iherman.github.io/r2epub/typedoc/modules/_cli_.html#cli) which works as follows:

```sh
cli [options] URL

Options are:
  --help                 Show help  [boolean]
  -o, --output           The name of the output file [string]
  -r, --respec           The source is in respec  [boolean] [default: false]
  -d, --publishDate      Publication date  [string] [default: null]
  -s, --specStatus       Specification type [string] [default: null]
  -l, --addSectionLinks  Add section links with "§"  [string] [default: null]
  -m, --maxTocLevel      Max TOC level [number] [default: null]
```

For the `-d`, `-s`, `-l`, or `-m` flags, see the [ReSpec manual](https://www.w3.org/respec/). If any of those flags is set, `-r` is implied (i.e., it is not necessary to set it explicitly).

In the absence of the `-o` flag the output will be `shortName.epub`, where the value of `shortName` is extracted from the [ReSpec configuration](https://github.com/w3c/respec/wiki/shortName).

By default, no URL-s on `localhost` are considered as safe and are rejected, unless the environment variable `R2EPUB_LOCAL` is explicitly set (the value of the variable is not relevant, only the setting is).

### Run a service via HTTP

There is a simple server implemented in [serve](https://iherman.github.io/r2epub/typedoc/modules/_server_.html#serve): running that simple Web server generate EPUB 3.2 instances for URL-s of the sort:

```sh
https://epub.example.org?url=https://www.example.org/doc.html
```

This would create and return the EPUB 3.2 instance corresponding to `https://www.example.org/doc.html`. Query parameters for `respec`, `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel` can be added, just like for the command line. I.e.,

``` sh
https://epub.example.org?url=https://www.example.org/doc.html&respec=true&specStatus=REC
```

converts the original file via respec, with the `specStatus` value set to `REC`. If one of `publishDate`, `specStatus`, `addSectionLinks`, or `maxTocLevel` are set, `respec=true` is implied (i.e., it is not necessary to set it explicitly).

By default, the server uses the `http` port number 80 (i.e., the default HTTP port), unless the `PORT` environment variable is set. Also, by default, no URL-s on `localhost` are accepted, unless the environment variable `R2EPUB_LOCAL` is explicitly set (the value of the variable is not relevant, only the setting is) for the server process.

The server has been deployed on the cloud, using [heroku](https://r2epub.herokuapp.com/).

### Client-side processing

The module has also been “browserified” and can be run on the client side, i.e., within a browser. A simple form, using the `url`, `respec`,  `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel` entries, can be used to trigger the necessary event handler: [submit](https://iherman.github.io/r2epub/typedoc/modules/_browser_.html#submit). The form has been made available through [an online HTML file](https://iherman.github.io/r2epub/client.html).


### Use as a typescript/node package through an API

The program can also be used from another Typescript or Javascript program. In Typescript, this simplest access is through:

``` js
import * as r2epub  from 'r2epub';
import * as fs      from 'fs';
// Create the class encapsulating the conversion functions
const convert              = new r2epub.RespecToEPUB();
// The creation itself is asynchronous (the content has to be fetched over the wire).
// The result is the class instance encapsulating an OCF (zip) content
const args :r2epub.Arguments = {
    url    :"http://www.example.org/doc.html",
    respec : false,
    config : {}
};
const ocf  :r2epub.OCF       = await convert.create_epub(args);
// The final zip file is finalized asynchronuously
// When run in node, the result is a Buffer; when in a browser, the result is a Blob
const content :Buffer|Blob = await ocf.get_content();
// Get the content out to the disk
fs.writeFileSync(ocf.name, content);
```

The same in Javascript:

``` js
const r2epub  = require('r2epub');
const fs      = require('fs');
// Create the class encapsulating the conversion functions
const convert = new r2epub.RespecToEPUB();
// The creation itself is asynchronous (the content has to be fetched over the wire).
// The result is the class instance encapsulating an OCF (zip) content
const args = {
    url    :"http://www.example.org/doc.html",
    respec : false,
    config : {}
};
const ocf     = await convert.create_epub("http://www.example.org/doc.html");
// The final zip file is finalized asynchronously
// When run in node, the result is a Buffer; when in a browser, the result is a Blob
const content = await ocf.get_content();
// Get the content out to the disk
fs.writeFileSync(ocf.name, content);
```

See the specification of the [RespecToEPUB](https://iherman.github.io/r2epub/typedoc/classes/_lib_convert_.respectoepub.html) and [OCF](https://iherman.github.io/r2epub/typedoc/classes/_lib_ocf_.ocf.html) classes for further details.

## Installation, usage

The implementation is in Typescript and on top of `node.js`. The project can be downloaded via `npm`:

```sh
npm install r2epub
```

The documentation is also available [on-line](https://iherman.github.io/r2epub/typedoc/).

Note that the on-the-fly conversion via respec is done by running the original source using an <a href='https://www.w3.org/2015/labs/'>online service</a> based on <a href="https://github.com/w3c/spec-generator">Spec Generator</a>. Alas!, that service may be down, and this package has no control over that…

### Installation

The usual `npm` approach applies:

``` sh
git clone https://github.com/iherman/r2epub.git
cd r2epub
npm install
```

The repository contains both the typescript code (in the `src`) directory as well as the transformed javascript code (in the `dist`) directory. If, for some reasons, the latter is not in the repository or is not up to date, the

``` sh
npm run build
```

command will take care of that.

Follow specific instructions based on your needs/interest below:

#### Command Line

``` sh
node dist/cli.js
```

starts the command line interface.

#### Server

``` sh
node dist/server.js
```

starts up the server. The port number used by the server can be determined by setting the `PORT` environmental variable; failing that the default (i.e., 80) is used.

An instance of the server is also deployed [on the cloud](https://r2epub.herokuapp.com/) at the `https://r2epub.herokuapp.com/` URL. A [client side interface](https://iherman.github.io/r2epub/convert.html) to drive this server is also available.

---

Copyright © 2020 [Ivan Herman](https://www.ivan-herman.net) (a.k.a. [@iherman](https://github.com/iherman)).
