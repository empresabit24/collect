import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'formaspago',
})
export class formaspago {
  @PrimaryGeneratedColumn()
  idformapago: number;

  @Column({ type: 'text' })
  formapago: string;

  @CreateDateColumn()
  fecharegistro: Date;

  @Column({ type: 'numeric' })
  idestado: number;

  @Column({ type: 'numeric' })
  idusuario: number;
}
