import { LucideIcon, ScanLine, RefreshCcw } from 'lucide-react-native';
import { cssInterop } from 'nativewind';

function interopIcon(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}

interopIcon(ScanLine);
interopIcon(RefreshCcw);

export { ScanLine, RefreshCcw };
