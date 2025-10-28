import { ThemeToggle } from '@/components/theme-toggle';
import { Bot } from 'lucide-react';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Bot className="h-6 w-6 mr-2 text-primary" />
          <a href="/" className="font-bold font-headline">DeskripsiAI</a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
