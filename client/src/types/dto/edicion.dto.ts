export interface CreateEdicionDto {
  isbn: string;
  idioma: string;
  año: number;
  numCopias: number;
}

export interface UpdateEdicionDto {
  isbn?: string;
  idioma?: string;
  año?: number;
}