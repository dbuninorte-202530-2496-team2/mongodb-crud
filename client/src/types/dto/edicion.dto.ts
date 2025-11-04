export interface CreateEdicionDto {
  isbn: string;
  idioma: string;
  año: string;
  numCopias: number;
}

export interface UpdateEdicionDto {
  isbn?: string;
  idioma?: string;
  año?: number;
}