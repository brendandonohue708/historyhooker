import { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';

const COLORS = ['#F5C76A', '#5CCB7A', '#3FB6E8', '#E8A33F', '#B85CFF'];

type Particle = {
  x: Animated.Value;
  y: Animated.Value;
  rot: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
};

// Particles are initialized inside useEffect — never at render time —
// so server and client first paint render the same empty origin div
// and React 19 hydration succeeds.
export function ConfettiBurst({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (particles.length > 0) return;
    setParticles(
      Array.from({ length: 30 }).map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        rot: new Animated.Value(0),
        opacity: new Animated.Value(0),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (trigger === 0 || particles.length === 0) return;
    const animations: Animated.CompositeAnimation[] = [];
    particles.forEach((p) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 160;
      p.x.setValue(0);
      p.y.setValue(0);
      p.rot.setValue(0);
      p.opacity.setValue(1);
      animations.push(
        Animated.parallel([
          Animated.timing(p.x, {
            toValue: Math.cos(angle) * distance,
            duration: 800 + Math.random() * 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: Math.sin(angle) * distance + 120,
            duration: 800 + Math.random() * 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(p.rot, {
            toValue: 1 + Math.random() * 2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(600),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
    });
    animations.forEach((a) => a.start());
  }, [trigger, particles]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.origin}>
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  {
                    rotate: p.rot.interpolate({
                      inputRange: [0, 3],
                      outputRange: ['0deg', '1080deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  origin: {
    position: 'absolute',
    top: '40%',
    left: '50%',
  },
  dot: {
    position: 'absolute',
    borderRadius: 1,
  },
});
