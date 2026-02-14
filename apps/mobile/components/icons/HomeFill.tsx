import { Path, Svg, SvgProps } from 'react-native-svg';

export default function HomeFillIcon(props: SvgProps) {
  return (
    <Svg width={props.width ?? 80} height={props.height ?? 80} viewBox='0 0 24 24' fill='none' {...props}>
      <Path d='M12.7071 2.29289C12.3166 1.90237 11.6834 1.90237 11.2929 2.29289L3.29289 10.2929C3.10536 10.4804 3 10.7348 3 11V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V15C10 14.4477 10.4477 14 11 14H13C13.5523 14 14 14.4477 14 15V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V11C21 10.7348 20.8946 10.4804 20.7071 10.2929L12.7071 2.29289Z' fill='#343C54' />
    </Svg>
  );
}
