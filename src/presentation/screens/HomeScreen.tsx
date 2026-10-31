
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';

interface HomeScreenProps {
  userName: string;
  onLogout: () => void;
  onAnalyze: () => void;
  onSimulate: () => void;
}

export default function HomeScreen({
  userName,
  onLogout,
  onAnalyze,
  onSimulate,
}: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pageContainer}>

          {/* ENCABEZADO */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>
                PREDICT<Text style={styles.brandAccent}>IA</Text>
              </Text>

              <Text style={styles.headerSubtitle}>
                FOOTBALL ANALYTICS
              </Text>
            </View>

            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.logoutIcon}>↗</Text>

              <View>
                <Text style={styles.logoutText}>
                  Cerrar sesión
                </Text>
                <Text style={styles.logoutUser}>
                  {userName}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* BIENVENIDA */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeTag}>
              <View style={styles.onlineDot} />
              <Text style={styles.overline}>
                PLATAFORMA DE ANÁLISIS DEPORTIVO
              </Text>
            </View>

            <Text style={styles.userGreeting}>
              Bienvenido, {userName}
            </Text>

            <Text style={styles.title}>
              El fútbol se{'\n'}
              <Text style={styles.titleAccent}>
                puede predecir.
              </Text>
            </Text>

            <Text style={styles.description}>
              Explora estadísticas históricas, analiza el
              rendimiento de las selecciones y descubre
              posibles resultados mediante simulaciones.
            </Text>
          </View>

          {/* TARJETA PRINCIPAL */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <View style={styles.heroDot} />
                <Text style={styles.heroBadgeText}>
                  SISTEMA ACTIVO
                </Text>
              </View>

              <Text style={styles.heroNumber}>
                01 / PREDICTIA
              </Text>
            </View>

            <View style={styles.heroContent}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroTitle}>
                  Los datos detrás{'\n'}
                  de cada partido.
                </Text>

                <Text style={styles.heroDescription}>
                  Convierte los resultados históricos en
                  información útil para estudiar el fútbol.
                </Text>
              </View>

              <View style={styles.heroBallContainer}>
                <Text style={styles.heroBall}>⚽</Text>
              </View>
            </View>

            <View style={styles.heroFooter}>
              <Text style={styles.heroFooterText}>
                DATOS · ESTADÍSTICAS · SIMULACIÓN
              </Text>
              <Text style={styles.heroArrow}>↗</Text>
            </View>
          </View>

          {/* INDICADORES */}
          <View style={styles.indicators}>
            <View style={styles.indicatorCard}>
              <Text style={styles.indicatorIcon}>▤</Text>
              <Text style={styles.indicatorTitle}>
                Datos históricos
              </Text>
              <Text style={styles.indicatorDescription}>
                Resultados internacionales
              </Text>
            </View>

            <View style={styles.indicatorCard}>
              <Text style={styles.indicatorIcon}>◉</Text>
              <Text style={styles.indicatorTitle}>
                Monte Carlo
              </Text>
              <Text style={styles.indicatorDescription}>
                Simulación de escenarios
              </Text>
            </View>

            <View style={styles.indicatorCard}>
              <Text style={styles.indicatorIcon}>🏆</Text>
              <Text style={styles.indicatorTitle}>
                Torneos
              </Text>
              <Text style={styles.indicatorDescription}>
                Cuadros de eliminación
              </Text>
            </View>
          </View>

          {/* HERRAMIENTAS */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionOverline}>
                HERRAMIENTAS
              </Text>
              <Text style={styles.sectionTitle}>
                Explora PREDICTIA
              </Text>
            </View>

            <Text style={styles.sectionNumber}>
              01 — 03
            </Text>
          </View>

          {/* ANÁLISIS */}
          <Pressable
            onPress={onAnalyze}
            style={({ pressed }) => [
              styles.moduleCard,
              pressed && styles.modulePressed,
            ]}
          >
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>▥</Text>
            </View>

            <View style={styles.moduleInfo}>
              <Text style={styles.moduleCategory}>
                ESTADÍSTICAS
              </Text>

              <Text style={styles.moduleTitle}>
                Análisis de equipos
              </Text>

              <Text style={styles.moduleDescription}>
                Consulta victorias, derrotas, empates y
                rendimiento histórico de las selecciones.
              </Text>
            </View>

            <View style={styles.moduleArrowContainer}>
              <Text style={styles.moduleArrow}>→</Text>
            </View>
          </Pressable>

          {/* SIMULACIÓN */}
          <Pressable
            onPress={onSimulate}
            style={({ pressed }) => [
              styles.moduleCard,
              pressed && styles.modulePressed,
            ]}
          >
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>◉</Text>
            </View>

            <View style={styles.moduleInfo}>
              <Text style={styles.moduleCategory}>
                MODELO MONTE CARLO
              </Text>

              <Text style={styles.moduleTitle}>
                Simulación de partidos
              </Text>

              <Text style={styles.moduleDescription}>
                Compara dos selecciones y calcula
                probabilidades de posibles resultados.
              </Text>
            </View>

            <View style={styles.moduleArrowContainer}>
              <Text style={styles.moduleArrow}>→</Text>
            </View>
          </Pressable>

          {/* TORNEOS */}
          <View style={styles.tournamentInfo}>
            <View style={styles.tournamentIcon}>
              <Text style={styles.tournamentIconText}>🏆</Text>
            </View>

            <View style={styles.tournamentText}>
              <Text style={styles.tournamentCategory}>
                MODO CAMPEONATO
              </Text>

              <Text style={styles.tournamentTitle}>
                Predicción de torneos
              </Text>

              <Text style={styles.tournamentDescription}>
                Simula las fases de eliminación, consulta
                los clasificados y descubre el campeón proyectado.
              </Text>
            </View>
          </View>

          {/* INFORMACIÓN */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>
              SOBRE EL PROYECTO
            </Text>

            <Text style={styles.infoTitle}>
              Tecnología aplicada al fútbol.
            </Text>

            <Text style={styles.infoDescription}>
              PREDICTIA utiliza información histórica de
              partidos y modelos matemáticos para estudiar
              diferentes escenarios deportivos. Sus resultados
              son estimaciones estadísticas y no garantizan
              el resultado real de un encuentro.
            </Text>
          </View>

          {/* PIE DE PÁGINA */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerBrand}>
                PREDICTFUTBOLIA
              </Text>
              <Text style={styles.footerDescription}>
                El fútbol, desde los datos.
              </Text>
            </View>

            <Text style={styles.footerVersion}>
              VERSIÓN 1.0
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101914',
  },
  scrollContent: {
    flexGrow: 1,
  },
  pageContainer: {
    width: '100%',
    maxWidth: 1050,
    alignSelf: 'center',
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandAccent: {
    color: '#B9F66A',
  },
  headerSubtitle: {
    color: '#78877D',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#344238',
    backgroundColor: '#1B2720',
  },
  logoutIcon: {
    color: '#B9F66A',
    fontSize: 19,
    fontWeight: '700',
  },
  logoutText: {
    color: '#F2F5F0',
    fontSize: 10,
    fontWeight: '800',
  },
  logoutUser: {
    color: '#B9F66A',
    fontSize: 9,
    marginTop: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  welcomeSection: {
    paddingHorizontal: 30,
    marginTop: 28,
    marginBottom: 30,
  },
  welcomeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#B9F66A',
  },
  overline: {
    color: '#B9F66A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  userGreeting: {
    color: '#A5B0A8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  titleAccent: {
    color: '#B9F66A',
  },
  description: {
    color: '#A5B0A8',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 15,
    maxWidth: 480,
  },
  heroCard: {
    marginHorizontal: 30,
    backgroundColor: '#B9F66A',
    borderRadius: 20,
    padding: 23,
    minHeight: 235,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#A4E653',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    backgroundColor: '#253820',
  },
  heroBadgeText: {
    color: '#253820',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroNumber: {
    color: '#526C3E',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroTextContent: {
    flex: 1,
    zIndex: 2,
  },
  heroTitle: {
    color: '#101914',
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '900',
    marginTop: 22,
  },
  heroDescription: {
    color: '#34472B',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
    maxWidth: 360,
  },
  heroBallContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    opacity: 0.23,
  },
  heroBall: {
    fontSize: 100,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#91C64D',
    paddingTop: 12,
    marginTop: 17,
  },
  heroFooterText: {
    color: '#34472B',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroArrow: {
    color: '#253820',
    fontSize: 19,
    fontWeight: '900',
  },
  indicators: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 30,
    marginTop: 18,
  },
  indicatorCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#19251E',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: '#2A3A2E',
  },
  indicatorIcon: {
    color: '#B9F66A',
    fontSize: 19,
    marginBottom: 10,
  },
  indicatorTitle: {
    color: '#F2F5F0',
    fontSize: 10,
    fontWeight: '900',
  },
  indicatorDescription: {
    color: '#829087',
    fontSize: 8,
    lineHeight: 13,
    marginTop: 5,
  },
  sectionHeader: {
    paddingHorizontal: 30,
    marginTop: 38,
    marginBottom: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionOverline: {
    color: '#829087',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 7,
  },
  sectionTitle: {
    color: '#F2F5F0',
    fontSize: 20,
    fontWeight: '900',
  },
  sectionNumber: {
    color: '#78877D',
    fontSize: 9,
    letterSpacing: 1,
  },
  moduleCard: {
    marginHorizontal: 30,
    marginBottom: 12,
    backgroundColor: '#1B2720',
    borderWidth: 1,
    borderColor: '#344238',
    borderRadius: 15,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modulePressed: {
    backgroundColor: '#26372B',
    borderColor: '#B9F66A',
    opacity: 0.85,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#2A3B2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconText: {
    color: '#B9F66A',
    fontSize: 25,
    fontWeight: '700',
  },
  moduleInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 8,
  },
  moduleCategory: {
    color: '#B9F66A',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  moduleTitle: {
    color: '#F2F5F0',
    fontSize: 14,
    fontWeight: '900',
  },
  moduleDescription: {
    color: '#94A197',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 6,
  },
  moduleArrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2A3B2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleArrow: {
    color: '#B9F66A',
    fontSize: 19,
    fontWeight: '900',
  },
  tournamentInfo: {
    marginHorizontal: 30,
    marginTop: 4,
    padding: 17,
    backgroundColor: '#19251E',
    borderWidth: 1,
    borderColor: '#B9F66A',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tournamentIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#2A3B2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tournamentIconText: {
    fontSize: 23,
  },
  tournamentText: {
    flex: 1,
    marginLeft: 15,
  },
  tournamentCategory: {
    color: '#B9F66A',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  tournamentTitle: {
    color: '#F2F5F0',
    fontSize: 14,
    fontWeight: '900',
  },
  tournamentDescription: {
    color: '#94A197',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 6,
  },
  infoSection: {
    marginHorizontal: 30,
    marginTop: 30,
    padding: 20,
    backgroundColor: '#17231B',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#B9F66A',
  },
  infoLabel: {
    color: '#B9F66A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  infoTitle: {
    color: '#F2F5F0',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 10,
  },
  infoDescription: {
    color: '#A5B0A8',
    fontSize: 11,
    lineHeight: 19,
    marginTop: 9,
  },
  footer: {
    marginHorizontal: 30,
    marginTop: 35,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#344238',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBrand: {
    color: '#78877D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  footerDescription: {
    color: '#78877D',
    fontSize: 9,
    marginTop: 5,
  },
  footerVersion: {
    color: '#78877D',
    fontSize: 9,
    letterSpacing: 1,
  },
});
