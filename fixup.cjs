#!/usr/bin/env node

const fs = require("node:fs")
const path = require("node:path")

function main(/* {string} */ project) {
    const types = {
        cjs: "commonjs",
        esm: "module",
    }

    for (const [distribution, type] of Object.entries(types)) {
        fs.writeFileSync(
            path.join(project, "dist", distribution, "package.json"),
            JSON.stringify({ type: type }, null, "\t")
        )
    }
}

if (require.main === module) {
    main(path.dirname(require.main.filename))
}
