import { Path, Svg, SvgProps } from 'react-native-svg';

export default function SavedFillIcon(props: SvgProps) {
  return (
    <Svg width={props.width ?? 80} height={props.height ?? 80} viewBox='0 0 24 24' fill='none' {...props}>
      <Path d='M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z' fill='#343C54' />
    </Svg>
  );
}
