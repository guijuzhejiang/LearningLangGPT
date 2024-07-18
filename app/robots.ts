// app/robots.ts  (App Router)
import {MetadataRoute} from "next";

const robots: MetadataRoute.Robots = () => {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // disallow: ""
        },
        sitemap: "https://zs.guijutech.com///sitemap.xml"
    };
};

export default robots;
