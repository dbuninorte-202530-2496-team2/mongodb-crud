export interface CreatePrestamoDTO {
  copia_id: string;      // ID de la copia seleccionada
  usuario_id: string;    // ID del usuario que recibe el préstamo
  fecha_prestamo: string; // Opcional, puedes asignarla después
}