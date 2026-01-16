import { generateLightColors } from '@kernelift/utils';

export function getPrimaryColor(color: string) {
  const colors = generateLightColors(color, 11, 1);
  const themeColors: { [key: number]: string } = {};
  const intensity = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  colors.forEach((color, index) => {
    // document.documentElement.style.setProperty(`--${prefix}-primary-${intensity[index]}`, color);
    if (index < intensity.length && intensity[index]) {
      themeColors[intensity[index]] = color;
    }
  });
  return themeColors;
}
