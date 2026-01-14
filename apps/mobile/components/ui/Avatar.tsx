import { useThemeColors } from '@/constants/useTheme';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const SIZES = {
  small: 32,
  medium: 48,
  large: 80,
};

const FONT_SIZES = {
  small: 14,
  medium: 18,
  large: 28,
};

export function Avatar({
  imageUrl,
  name,
  email,
  size = 'medium',
  onPress,
}: AvatarProps) {
  const colors = useThemeColors();
  const dimension = SIZES[size];
  const fontSize = FONT_SIZES[size];

  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const content = (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize,
                color: colors.white,
              },
            ]}
          >
            {getInitials()}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: 'Poppins_500Medium',
  },
});
