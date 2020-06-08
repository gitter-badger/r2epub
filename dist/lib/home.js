"use strict";
/**
 * ## Service home page
 *
 * The stable Web page, displayed by the server if there is no query string. It just displays some basic information about the usage of a server.
 *
 * (It is a single string with the HTML content, with a pattern: this is replaced by the host URL.)
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
*
*
*/
/** @hidden */
exports.homepage = `<!doctype html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Service to convert W3C Technical Reports to EPUB 3.2</title>
    <link rel='stylesheet' href='https://iherman.github.io/r2epub/assets/css/convert.css' />
</head>

<body>
    <main>
        <h1>Service to convert W3C Technical Reports to EPUB 3.2</h1>

        <p>This is an interface an on-line service to convert W3C Technical Reports, authored in <a href="https://github.com/w3c/respec/wiki/">ReSpec</a>, to EPUB 3.2</p>

        <p>
            The service receives the parameters through the form above, and generates an EPUB 3.2 instance stored on the local machine. The possible form parameters are:
        </p>

        <dl>
            <dt id='url'><code>url</code></dt>
            <dd>The URL for the either the (HTML) content <em>or</em> for the <a href='https://iherman.github.io/r2epub/typedoc/modules/_clib_args_.html'>(JSON) configuration file</a> for a collection of documents. In the second case all other parameter values are ignored. <em>This value is required</em>.</dd>

            <dt id='respec'><code>respec</code></dt>
            <dd>Whether the source has to be pre-processed by ReSpec (“true”) or is a final HTML (“false”). If the former, the source is converted using <a href="https://github.com/w3c/spec-generator">W3C’s Spec Generator</a> into HTML first.</dd>

            <dt id='pdate'><code>publishDate</code></dt>
            <dd><sup>(☨)</sup>Publication date. Overwrites the <a href='https://github.com/w3c/respec/wiki/publishDate'>value in the “<code>respecConfig</code>” structure</a> in the source.</dd>

            <dt id="status"><code>specStatus</code></dt>
            <dd>Specification date. Overwrites the <a href='https://github.com/w3c/respec/wiki/specStatus'>value in the “<code>respecConfig</code>” structure</a> in the source.</dd>

            <dt id='seclink'><code>addSectionLinks</code></dt>
            <dd>Add section links with a <code>§</code> character. Overwrites the <a href='https://github.com/w3c/respec/wiki/addSectionLinks'>value in the “<code>respecConfig</code>” structure</a> in the source.</dd>

            <dt id='toclevel'><code>maxTocLevel</code></dt>
            <dd>Maximum sectioning level for the Table of Content. Overwrites the <a href='https://github.com/w3c/respec/wiki/maxTocLevel'>value in the “<code>respecConfig</code>” structure</a> in the source.</dd>
        </dl>

        <p>
            By default, the value of <code>respec</code> is <code>false</code>. However, if one of <code>publishDate</code>, <code>specStatus</code>, <code>addSectionLinks</code>, or <code>maxTocLevel</code> are set, <code>respec=true</code> is implied (i.e., it is not necessary to set it explicitly).
        </p>

        <h2>Usage examples</h2>

        <p>
            Convert the HTML file (as generated by ReSpec) to an EPUB 3.2 file. The generated publication's name is <code>short-name.epub</code>, where <code>short-name</code> is set in the ReSpec configuration:
        </p>

        <pre>%%%SERVER%%%?url=https://www.example.org/doc.html</pre>

        <p>Convert the HTML <em>ReSpec source</em> to an EPUB 3.2 file. The source is converted on-the-fly by respec:</p>

        <pre>%%%SERVER%%%?url=https://www.example.org/doc.html&respec=true</pre>

        <p>Convert the HTML <em>ReSpec source</em> to an EPUB 3.2 file, setting its spec status to REC. The source is converted on-the-fly by respec, overwriting the <code>specStatus</code> entry in the configuration to <code>REC</code>:</p>

        <pre>%%%SERVER%%%?url=https://www.example.org/doc.html&respec=true&specStatus=REC</pre>

        <p>Generates a collection of HTML documents to an EPUB 3.2 file, described by a <a href='https://iherman.github.io/r2epub/typedoc/modules/_clib_args_.html'>(JSON) configuration file</a>:</p>

        <pre>%%%SERVER%%%?url=https://www.example.org/collection.json</pre>

    </main>
    <footer style='font-size:80%; border-top: thin solid black;'>
        <p>This server runs the <a href='https://github.com/iherman/r2epub/'>r2epub</a> script; see the <a href='https://iherman.github.io/r2epub/'>documentation</a> for more details. Copyright © 2020 <a href='https://www.ivan-herman.net/'>Ivan Herman</a>. </p>
    </footer>
</body>
</html>
`;
//# sourceMappingURL=home.js.map