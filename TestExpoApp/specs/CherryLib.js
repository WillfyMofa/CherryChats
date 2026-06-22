import { NativeCherryLib } from "./NativeCherryLib";

/*
 * returns uuid of app
 * format: xxxx xxxx - xxxx - xxxx - xxxx - xxxx xxxx xxxx
 * without spaces, spaces for simple reading
 * example: ffff1111-ffff-1111-ffff-1111ffff1111
 */
export function getUuid() {
  return NativeCherryLib.getUuid();
}
