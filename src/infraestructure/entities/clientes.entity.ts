import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { personas } from './personas.entity';
import { receivable } from '../../collect/entities/receivable.entity';

@Entity({
  name: 'clientes',
})
export class clientes {
  @PrimaryGeneratedColumn()
  idcliente: number;

  @Column({ type: 'numeric' })
  codigodirecto: number;

  @Column({ type: 'numeric' })
  idpersona: number;

  @Column({ type: 'numeric' })
  idestado: number;

  @OneToOne(() => personas)
  @JoinColumn({ name: 'idpersona' })
  infoPersona: personas;

  @OneToMany(() => receivable, (receivable) => receivable.cliente)
  @JoinColumn({ name: 'idcliente' })
  receivables: receivable[];
}
