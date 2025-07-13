declare module "@fontsource/inter";

declare module "*.svg?react" {
  import { ComponentType } from "preact";
  const content: ComponentType<{ className?: string; style?: any }>;
  export default content;
}
