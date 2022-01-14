import React from 'react';
import { Svg, Path } from 'react-native-svg';

export default ({ color, size = 1 }) => (
  <Svg
    width={size * 20}
    height={size * 20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      d="M13.0701 9.45759L11.7207 8.73553C11.902 8.18994 12.0001 7.6064 12.0001 6.99994C12.0001 3.96237 9.53768 1.49994 6.50011 1.49994C5.9054 1.49994 5.33273 1.59433 4.79626 1.76895C6.22818 0.103517 8.67134 -0.407253 10.6884 0.671986C12.5768 1.68244 13.5931 3.58164 13.1748 5.60523L18.0907 8.23552C18.2284 8.30919 18.3375 8.42678 18.4006 8.56959L19.0729 10.0896C19.257 10.506 19.0009 10.9846 18.5523 11.0624L16.8503 11.3577C16.7382 11.3771 16.6229 11.3585 16.5226 11.3049L15.6474 10.8366L15.4249 10.0445L14.855 10.2298C14.5796 10.3193 14.285 10.1619 14.2064 9.88313L14.0435 9.30534L13.4689 9.49277C13.3367 9.53588 13.1927 9.52317 13.0701 9.45759Z"
      fill={color || '#4070F4'}
    />
    <Path
      d="M5.47972 5.08388C5.204 5.14792 5.0324 5.42334 5.09644 5.69906C5.16048 5.97477 5.4359 6.14637 5.71162 6.08233C5.98733 6.0183 6.15893 5.74287 6.09489 5.46716C6.03086 5.19144 5.75543 5.01984 5.47972 5.08388Z"
      fill={color || '#4070F4'}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.07721 8.50604C1.56478 10.6053 3.16702 12.1601 5.21839 12.4226L5.64535 14.261C5.6768 14.3964 5.76217 14.5131 5.88168 14.5841L6.46259 14.9291L6.09645 15.4922C5.93859 15.735 6.01431 16.0603 6.26316 16.2084L6.83939 16.5514L6.35132 17.3005L6.58705 18.3155C6.61279 18.4263 6.67484 18.5253 6.76334 18.5968L8.20454 19.7611C8.55871 20.0472 9.08745 19.9244 9.27927 19.5114L10.0322 17.8905C10.098 17.7489 10.1146 17.5893 10.0792 17.4372L8.73201 11.6366C10.6443 10.5646 11.454 8.42913 10.9398 6.21536C10.3073 3.49187 7.58668 1.79683 4.86319 2.42939C2.1397 3.06194 0.44466 5.78255 1.07721 8.50604ZM4.31718 5.88005C4.15319 5.17396 4.59264 4.46862 5.29873 4.30462C6.00481 4.14063 6.71016 4.58008 6.87415 5.28617C7.03815 5.99226 6.59869 6.6976 5.8926 6.86159C5.18652 7.02559 4.48118 6.58613 4.31718 5.88005Z"
      fill={color || '#4070F4'}
    />
  </Svg>
);
