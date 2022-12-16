import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';

type ThumbnailProps = Partial<ImageProps> & {
  src: string | undefined;
  alt: string;
}

const Thumbnail: React.FC<ThumbnailProps> = (props) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const fetchThumbnail = async () => {
      const response = await fetch(props.src as string)

      if (response.status !== 200) {
        setTimeout(fetchThumbnail, 1000);
        return;
      }

      setSrc(props.src);
    };

    if (props.src) {
      if (typeof props.src !== "string" || props.src.startsWith('data')) {
        setSrc(props.src);
        return;
      }

      fetchThumbnail();
    }
  }, [props.src]);

  return <Image 
    {...props} 
    alt={props.alt} 
    src={src || "/spinner.svg"}></Image>
};

export default Thumbnail;
