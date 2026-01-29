import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';

interface ImageGalleryProps {
  images: { uri: string }[];
  style?: any;
}

// Rule 9.6: Use Galeria for image galleries with lightbox
// Provides native shared element transitions, pinch-to-zoom, pan-to-close
export const ImageGallery = memo(function ImageGallery({
  images,
  style,
}: ImageGalleryProps) {
  const urls = images.map((img) => img.uri);

  return (
    <Galeria urls={urls}>
      <View style={[styles.container, style]}>
        {images.map((img, index) => (
          <Galeria.Image key={img.uri} index={index}>
            <Image
              source={{ uri: img.uri }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </Galeria.Image>
        ))}
      </View>
    </Galeria>
  );
});

// Single tappable image with lightbox
export const TappableImage = memo(function TappableImage({
  uri,
  style,
}: {
  uri: string;
  style?: any;
}) {
  return (
    <Galeria urls={[uri]}>
      <Galeria.Image>
        <Image
          source={{ uri }}
          style={[styles.singleImage, style]}
          contentFit="cover"
          transition={200}
        />
      </Galeria.Image>
    </Galeria>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    flex: 1,
    minWidth: 100,
    minHeight: 100,
  },
  singleImage: {
    width: '100%',
    height: '100%',
  },
});
