#!/usr/bin/env node
/**
 * Fails when a `.module.uss` file styles a `unity-*` class that UI Toolkit
 * never puts on an element.
 *
 * Every component here skins native controls by reaching for the class names
 * UI Toolkit assigns. Those names are not checked by anything: USS has no
 * notion of an undefined selector, so a rule keyed off a class that does not
 * exist is not an error, not a warning, and not a visible difference at the
 * moment it is written. It is simply a rule that never matches, and the skin
 * looks finished.
 *
 * That is not hypothetical. The ScrollView skin shipped two rules keyed off
 * `unity-scroll-view--has-thumb`, which is not a UI Toolkit class. They were
 * the only rules that painted the scroller groove, so the groove never
 * painted, and because the rules above them suppressed the theme's own groove
 * unconditionally, the track stayed invisible even when content overflowed.
 * Lint passed, the typecheck passed, and a screenshot of a short list looked
 * correct, because a short list has no scrollbar to be wrong about.
 *
 * WHY A VOCABULARY AND NOT A LIST OF CLASSES
 *
 * unity-uss-vocabulary.json holds two sets pulled out of the UI Toolkit
 * assembly: the `unity-*` string literals, and the `--x` / `__y` suffixes that
 * the controls concatenate onto them. UI Toolkit builds its class names that
 * way in C#:
 *
 *     public static readonly string ussClassName = "unity-scroll-view";
 *     public static readonly string verticalVariantUssClassName = ussClassName + "--vertical";
 *
 * so the full names mostly do not exist as literals to be read off. Checking a
 * name by decomposing it into a known base plus known suffixes accepts every
 * real combination without anybody maintaining the combinations by hand, and
 * still rejects an invented one: `--has-thumb` is not a suffix UI Toolkit uses
 * anywhere, so no decomposition of `unity-scroll-view--has-thumb` succeeds.
 *
 * It is deliberately permissive. It will accept a base and suffix that are
 * each real but never occur together. That is the right trade here: the
 * failure this guards against is a name invented whole, and a check that
 * cried wolf about legitimate skinning would be turned off within a week.
 *
 * REGENERATING the vocabulary after a Unity upgrade:
 *
 *     dotnet tool install ilspycmd --tool-path /tmp/ilspy-tool
 *     DOTNET_ROLL_FORWARD=LatestMajor /tmp/ilspy-tool/ilspycmd -o /tmp/uie-src \
 *       "<Unity>/PlaybackEngines/MacStandaloneSupport/Variations/mono/Managed/UnityEngine.UIElementsModule.dll"
 *
 * then collect `"(unity-[A-Za-z0-9_-]+)"` as bases and `\+ "((?:--|__)[A-Za-z0-9-]+)"`
 * as suffixes from the decompiled source, and update unityVersion.
 */

import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const SRC = path.join(ROOT, "src")

const vocab = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "unity-uss-vocabulary.json"), "utf8"))
const bases = new Set(vocab.bases)
const suffixes = vocab.suffixes

/**
 * True when `name` is a base, or a base followed by up to two known suffixes.
 * Two because a control can qualify a part and then modify it, as in
 * `unity-scroller__slider--horizontal`.
 */
const isKnown = (name) => {
    if (bases.has(name)) return true
    for (const suffix of suffixes) {
        if (!name.endsWith(suffix)) continue
        const head = name.slice(0, -suffix.length)
        if (bases.has(head)) return true
        for (const inner of suffixes) {
            if (head.endsWith(inner) && bases.has(head.slice(0, -inner.length))) return true
        }
    }
    return false
}

const ussFiles = []
const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) walk(full)
        else if (e.name.endsWith(".uss")) ussFiles.push(full)
    }
}
walk(SRC)

const bad = []
for (const file of ussFiles.sort()) {
    const text = fs.readFileSync(file, "utf8")
    text.split("\n").forEach((line, i) => {
        // Only class selectors. A leading dot is what separates `.unity-toggle`
        // from the `-unity-slice-top` property, which shares the prefix and is
        // not a class at all.
        for (const m of line.matchAll(/\.(unity-[A-Za-z0-9_-]+)/g)) {
            if (!isKnown(m[1])) bad.push({ file: path.relative(ROOT, file), line: i + 1, name: m[1] })
        }
    })
}

if (bad.length > 0) {
    console.error(`${bad.length} USS rule(s) key off a class UI Toolkit does not assign:\n`)
    for (const b of bad) console.error(`  ${b.file}:${b.line}  .${b.name}`)
    console.error(`\nChecked against UI Toolkit ${vocab.unityVersion}. A rule with a selector like this never`)
    console.error("matches, so whatever it was meant to paint is simply not painted. Either the name is wrong,")
    console.error("or the state it describes has to be produced by the component rather than read off the")
    console.error("element. See the header of scripts/check-uss-classes.mjs.")
    process.exit(1)
}

console.log(`${ussFiles.length} USS files: every unity-* class checks out against UI Toolkit ${vocab.unityVersion}.`)
