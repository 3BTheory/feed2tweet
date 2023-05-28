import { main, authCallback, authorizeTwitter } from "./main";

declare const global: {
  [x: string]: any;
};

global.main = main;
global.authCallback = authCallback;
global.authorizeTwitter = authorizeTwitter;
