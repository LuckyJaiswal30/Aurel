import Link from "next/link";
import { AurelMark } from "./aurel-mark";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 font-serif text-xl font-medium text-text"
    >
      <AurelMark className="size-5" />
      Aurel
    </Link>
  );
}
