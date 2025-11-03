import { Autor } from '../api/types';
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatAutores = (autores: Autor[], limit = 2) => {
  if (!autores || autores.length === 0) return 'Autor desconocido';
  
  const nombres = autores
    .slice(0, limit)
    .map(a => a.nombre.split(' ').map(capitalize).join(' '));
  
  if (autores.length > limit) {
    return `${nombres.join(', ')} y ${autores.length - limit} más`;
  }
  
  return nombres.join(', ');
};