import { Path, Svg, SvgProps } from 'react-native-svg';

export default function MapIcon(props: SvgProps) {
  return (
    <Svg width={props.width ?? 80} height={props.height ?? 80} viewBox='0 0 24 24' fill='none' {...props}>
      <Path opacity={0.4} d='M12 2C8.13 2 5 5.13 5 9C5 13.17 9.42 18.92 11.24 21.11C11.64 21.59 12.37 21.59 12.77 21.11C14.58 18.92 19 13.17 19 9C19 5.13 15.87 2 12 2Z' fill='#343C54' />
      <Path d='M12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z' fill='#343C54' />
    </Svg>
  );
}
