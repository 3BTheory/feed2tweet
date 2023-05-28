import { main } from "./main";

declare const global: {
  [x: string]: any;
};

global.main = () => {
  main();
};
