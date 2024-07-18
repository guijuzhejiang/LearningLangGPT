const globby = require("globby");

function addPage(page: string) {
    const path = page
        .replace("app", "")
        .replace("(chat)/", "")
        .replace(".tsx", "")
        .replace(".mdx", "")
        .replace("/page", "");
    return path;
}
export default async function sitemap() {
    if (!process.env.SITE_URL) {
        process.env.SITE_URL = "https://zs.guijutech.com/learninglang";
    }

    const pages = await globby([
        "app/**/*{.js,jsx,tsx,.mdx}",
        "!app/**/*layout.tsx",
        "!app/_*.js",
        "!app/{sitemap,layout}.{js,jsx,ts,tsx}",
        "!app/api",
    ]);
    const routes = pages.map((page: string) => ({
        url: `${process.env.SITE_URL}${addPage(page)}`,
        lastModified: new Date().toISOString(),
        priority: 0.8,

    }));

    routes.push(process.env.SITE_URL.replace("/learninglang", ""))

    return [...routes];
}