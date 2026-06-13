/**
 * Hashing y verificación de contraseñas con bcrypt.
 */
import bcrypt from 'bcryptjs';

const RONDAS = 10;

export async function hashearPassword(plano: string): Promise<string> {
  return bcrypt.hash(plano, RONDAS);
}

export async function compararPassword(plano: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plano, hash);
}
