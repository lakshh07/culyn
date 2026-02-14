import { Path, Svg, SvgProps } from 'react-native-svg';

export default function HomeIcon(props: SvgProps) {
  return (
    <Svg width={props.width ?? 80} height={props.height ?? 80} viewBox='0 0 24 24' fill='none' {...props}>
      <Path d='M12.7071 2.29289C12.3166 1.90237 11.6834 1.90237 11.2929 2.29289L3.29289 10.2929C3.10536 10.4804 3 10.7348 3 11V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V15H14V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V11C21 10.7348 20.8946 10.4804 20.7071 10.2929L12.7071 2.29289Z' fill='#343C54' opacity={0.4} />
      <Path d='M12 4.41421L5 11.4142V19H8V14C8 13.4477 8.44772 13 9 13H15C15.5523 13 16 13.4477 16 14V19H19V11.4142L12 4.41421Z' fill='#343C54' />
    </Svg>
  );
}
