import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'documentosventa',
})
export class documentosventa {
  @PrimaryGeneratedColumn()
  iddocumentoventa: number;

  @Column({ type: 'text' })
  nombre: string;

  @CreateDateColumn()
  fecha: Date;

  @Column({ type: 'text' })
  numerodocumento: string;

  @Column({ type: 'text' })
  serie: string;

  @Column({ type: 'text' })
  razonsocial: string;

  @Column({ type: 'text' })
  direccion: string;

  @Column({ type: 'text' })
  ruc: string;

  @CreateDateColumn()
  fecharegistro: Date;

  @Column({ type: 'numeric' })
  idticketventa: number;

  @Column({ type: 'decimal' })
  importetotal: number;

  @Column({ type: 'decimal' })
  redondeo: number;

  @Column({ type: 'decimal' })
  igv: number;

  @Column({ type: 'numeric' })
  porcentajeigv: number;

  @Column({ type: 'numeric' })
  totaldescuento: number;

  // FALTAN COLUMNAS
}
