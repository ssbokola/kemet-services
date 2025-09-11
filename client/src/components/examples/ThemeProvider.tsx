import { ThemeProvider } from '../ThemeProvider';
import { Button } from '@/components/ui/button';

function ThemeToggleExample() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Theme Provider Example</h3>
      <p className="text-muted-foreground">Theme provider is working correctly with the app.</p>
      <Button>Sample Button</Button>
    </div>
  );
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider defaultTheme="light">
      <ThemeToggleExample />
    </ThemeProvider>
  );
}