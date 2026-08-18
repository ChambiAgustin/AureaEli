/**
 * HapticsService
 * Servicio centralizado para feedback táctil (Haptic Feedback) envolviendo navigator.vibrate.
 */
export class HapticsService {
  private static vibrate(pattern: number | number[]): void {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Fallback seguro en navegadores/dispositivos sin soporte o con restricciones
      }
    }
  }

  /** Vibra brevemente para selecciones en la UI */
  public static selection(): void {
    HapticsService.vibrate(10);
  }

  /** Vibra brevemente para interacciones leves (botones, selecciones) */
  public static light(): void {
    HapticsService.vibrate(10);
  }

  /** Vibra con intensidad media para cambios de estado/filtros */
  public static medium(): void {
    HapticsService.vibrate(25);
  }

  /** Patrón de vibración rítmica para acciones exitosas (como agregar al carrito) */
  public static success(): void {
    HapticsService.vibrate([15, 50, 25]);
  }
}

export default HapticsService;
