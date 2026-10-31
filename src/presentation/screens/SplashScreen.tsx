
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
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
      <View style={styles.mainContent}>
        <Text style={styles.overline}>
          FOOTBALL DATA & ANALYTICS
        </Text>

        <Text style={styles.title}>
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
        <View style={styles.pitch}>
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
        <View style={styles.features}>
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
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    maxWidth: 450,
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
    fontSize: 39,
    fontWeight: '800',
    lineHeight: 46,
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
    maxWidth: 330,
  },

  pitch: {
    height: 155,
    marginTop: 32,
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
    height: 75,
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
    height: 75,
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
    marginTop: 30,
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
    maxWidth: 450,
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
