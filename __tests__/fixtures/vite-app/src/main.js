import "./styles.css"

document.getElementById("app").textContent = "main bundle"
document.body.dataset.main = "ready"

import("./lazy.js").then(({ run }) => run())
