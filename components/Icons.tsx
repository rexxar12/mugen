import { LucideIcon, ScanLine, RefreshCcw, Check, X } from 'lucide-react-native';
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
interopIcon(Check);
interopIcon(X);
export { ScanLine, RefreshCcw, Check, X };
