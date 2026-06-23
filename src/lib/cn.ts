// Tiny className helper — avoids pulling in clsx for a 3-line job.
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
