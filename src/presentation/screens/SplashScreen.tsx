
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isSmallHeight = height < 700;

  const horizontalSpace = isMobile ? 22 : isTablet ? 40 : 55;

  const titleSize = isMobile
    ? width < 380 ? 34 : 39
    : isTablet ? 45 : 52;

  const pitchHeight = isMobile ? 135 : isTablet ? 165 : 185;

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalSpace,
          paddingTop: isMobile ? 25 : 35,
          paddingBottom: isMobile ? 18 : 24,
        },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <View style={styles.markLine} />
          <View style={styles.markCircle} />
        </View>

        <Text style={styles.brandName}>
          PREDICT<Text style={styles.brandAccent}>IA</Text>
        </Text>
      </View>

      {/* Contenido principal */}
      <View
        style={[
          styles.mainContent,
          {
            maxWidth: isMobile ? 450 : 600,
            transform: [
              { scale: isSmallHeight && isMobile ? 0.94 : 1 },
            ],
          },
        ]}
      >
        <Text style={styles.overline}>
          FOOTBALL DATA & ANALYTICS
        </Text>

        <Text
          style={[
            styles.title,
            {
              fontSize: titleSize,
              lineHeight: titleSize * 1.18,
            },
          ]}
        >
          El fútbol,{'\n'}
          <Text style={styles.titleAccent}>
            desde los datos.
          </Text>
        </Text>

        <Text style={styles.description}>
          Analiza el rendimiento de los equipos y
          descubre posibles escenarios mediante
          modelos de simulación.
        </Text>

        {/* Representación de cancha */}
        <View
          style={[
            styles.pitch,
            { height: pitchHeight },
          ]}
        >
          <View style={styles.pitchLineVertical} />
          <View style={styles.pitchLineHorizontal} />
          <View style={styles.centerCircle} />

          <View style={styles.leftArea}>
            <View style={styles.leftGoal} />
          </View>

          <View style={styles.rightArea}>
            <View style={styles.rightGoal} />
          </View>

          <View style={styles.dot} />
        </View>

        {/* Características */}
        <View
          style={[
            styles.features,
            {
              marginTop: isMobile ? 24 : 32,
            },
          ]}
        >
          <View style={styles.feature}>
            <Text style={styles.featureNumber}>01</Text>
            <Text style={styles.featureText}>DATOS</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureNumber}>02</Text>
            <Text style={styles.featureText}>MODELOS</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureNumber}>03</Text>
            <Text style={styles.featureText}>PREDICCIÓN</Text>
          </View>
        </View>
      </View>

      {/* Pie de pantalla */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />

        <View style={styles.footerContent}>
          <Text style={styles.footerText}>
            PREDICTFUTBOLIA
          </Text>

          <Text style={styles.version}>
            VERSIÓN 1.0
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101914',
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },

  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#B9F66A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  markLine: {
    width: 20,
    height: 4,
    backgroundColor: '#101914',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 5,
  },

  markCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#101914',
    right: 6,
    top: 6,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },

  brandAccent: {
    color: '#B9F66A',
  },

  mainContent: {
    width: '100%',
    alignSelf: 'center',
  },

  overline: {
    color: '#B9F66A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 17,
  },

  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -1.5,
  },

  titleAccent: {
    color: '#B9F66A',
  },

  description: {
    color: '#A5B0A8',
    fontSize: 14,
    lineHeight: 23,
    marginTop: 19,
    maxWidth: 380,
  },

  pitch: {
    width: '100%',
    marginTop: 28,
    backgroundColor: '#1C2C21',
    borderWidth: 1,
    borderColor: '#425B3C',
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pitchLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#58744B',
  },

  pitchLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#58744B',
  },

  centerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#78966B',
  },

  leftArea: {
    position: 'absolute',
    left: 0,
    width: 42,
    height: '48%',
    borderWidth: 1,
    borderColor: '#58744B',
    borderLeftWidth: 0,
    justifyContent: 'center',
  },

  leftGoal: {
    width: 13,
    height: 35,
    borderWidth: 1,
    borderColor: '#78966B',
    borderLeftWidth: 0,
  },

  rightArea: {
    position: 'absolute',
    right: 0,
    width: 42,
    height: '48%',
    borderWidth: 1,
    borderColor: '#58744B',
    borderRightWidth: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  rightGoal: {
    width: 13,
    height: 35,
    borderWidth: 1,
    borderColor: '#78966B',
    borderRightWidth: 0,
  },

  dot: {
    position: 'absolute',
    width: 7,
    height: 7,
    backgroundColor: '#B9F66A',
    borderRadius: 4,
    right: '30%',
    top: '35%',
  },

  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  feature: {
    gap: 7,
  },

  featureNumber: {
    color: '#B9F66A',
    fontSize: 11,
    fontWeight: '800',
  },

  featureText: {
    color: '#D5DED6',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  footer: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },

  footerLine: {
    height: 1,
    backgroundColor: '#344238',
    marginBottom: 17,
  },

  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },

  footerText: {
    color: '#87958A',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  version: {
    color: '#87958A',
    fontSize: 9,
    letterSpacing: 1,
  },
});
