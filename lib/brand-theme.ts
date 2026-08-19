export function themeBrandSvg(source: string, accent: string, strong: string) {
  return source
    .replaceAll('fill="rgb(38,38,38)"', `fill="${accent}"`)
    .replaceAll('fill="rgb(11,12,12)"', `fill="${strong}"`)
    .replace('viewBox="0 0 2048 2048"', 'viewBox="560 480 960 960"')
    .replace('width="1024" height="1024"', 'width="512" height="512"')
    .replace('preserveAspectRatio="none"', 'preserveAspectRatio="xMidYMid meet"');
}
