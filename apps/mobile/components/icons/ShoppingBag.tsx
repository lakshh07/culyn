import * as React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

export default function ShoppingBagIcon(props: SvgProps) {
  const color = props.color || '#343C54'
  return (
    <Svg
      width={props.width ?? 80}
      height={props.height ?? 80}
      viewBox="0 0 24 24"
      fill="none"
      {...props}>
      <Path
        d="M8.5 6V5C8.5 3.067 10.067 1.5 12 1.5C13.933 1.5 15.5 3.067 15.5 5V6H18C19.1046 6 20 6.89543 20 8V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V8C4 6.89543 4.89543 6 6 6H8.5ZM10 6H14V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V6Z"
        fill={color}
      />
      <Path
        opacity={0.4}
        d="M8.5 10C8.5 10.2761 8.72386 10.5 9 10.5C9.27614 10.5 9.5 10.2761 9.5 10V8H8.5V10ZM14.5 10C14.5 10.2761 14.7239 10.5 15 10.5C15.2761 10.5 15.5 10.2761 15.5 10V8H14.5V10Z"
        fill={color}
      />
    </Svg>
  )
}
