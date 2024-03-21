import { createAnimations } from '@tamagui/animations-react-native';
import { createInterFont } from '@tamagui/font-inter';
import { createTamagui } from 'tamagui';
import { config as v3Config } from '@tamagui/config/src/v3';
import { createMedia } from '@tamagui/react-native-media-driver';

const animations = createAnimations({
  bouncy: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
    type: 'spring',
  },
  lazy: {
    damping: 20,
    type: 'spring',
    stiffness: 60,
  },
  quick: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
    type: 'spring',
  },
  // Add your new animation configuration here
  newAnimation: {
    damping: 15,
    mass: 1.0,
    stiffness: 200,
    type: 'spring',
  },
});

const headingFont = createInterFont();

const bodyFont = createInterFont();

const config = createTamagui({
  ...v3Config,
  animations,
  fonts: { body: bodyFont, heading: headingFont },
  media: createMedia({
    xs: { maxWidth: 660 },
    // ...
  }),
});

type AppConfig = typeof config;

// Enable auto-completion of props shorthand (ex: jc="center") for Tamagui templates.
// Docs: https://tamagui.dev/docs/core/configuration

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
