import { Card } from "./card";
import { cn } from "@/lib/utils";

export function DarkCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("bg-brand-dark border-brand-copper text-white", className)} {...props} />;
}
