import { Wordmark } from "@/components/ui/wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh px-4 pb-16">
      <header className="flex h-16 items-center md:px-4">
        <Wordmark />
      </header>
      <main>{children}</main>
    </div>
  );
}
