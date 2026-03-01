import { Path, Svg, SvgProps } from 'react-native-svg'

export default function ChatIcon(props: SvgProps) {
  return (
    <Svg
      width={props.width ?? 80}
      height={props.height ?? 80}
      viewBox="0 0 24 24"
      fill="none"
      {...props}>
      <Path
        opacity={0.4}
        d="M12 2C6.48 2 2 5.58 2 10C2 12.12 3.04 14.05 4.75 15.43L3.6 19.07C3.47 19.5 3.92 19.87 4.32 19.67L8.27 17.67C9.44 18.05 10.7 18.25 12 18.25C17.52 18.25 22 14.67 22 10.25C22 5.83 17.52 2 12 2Z"
        fill="#343C54"
      />
      <Path
        d="M8 9.5C8 8.67 8.67 8 9.5 8H14.5C15.33 8 16 8.67 16 9.5C16 10.33 15.33 11 14.5 11H9.5C8.67 11 8 10.33 8 9.5Z"
        fill="#343C54"
      />
    </Svg>
  )
}
