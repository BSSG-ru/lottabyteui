interface Mapping { [key: string]: string; }
declare module '*.module.css' { const mapping: Mapping; export default mapping; }
declare module '*.module.scss' { const mapping: Mapping; export default mapping; }

declare module "\*.svg" {
    import React = require("react");
    export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}
declare module "\*.jpg" {
    const content: string;
    export default content;
}

declare module "\*.png" {
    const content: string;
    export default content;
}

declare module "\*.json" {
    const content: string;
    export default content;
}

declare module 'uuid';