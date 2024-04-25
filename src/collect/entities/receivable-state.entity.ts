import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'receivable-state',
})
export class receivableState {
  @PrimaryGeneratedColumn()
  id_receivable_state: number;

  @Column({ type: 'text' })
  description: string;
}
