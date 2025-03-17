import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';
import { CloudProvider } from '../dto/create-deployment-config.dto';

@Entity('deployment_configs')
export class DeploymentConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CloudProvider,
  })
  provider: CloudProvider;

  @Column({ type: 'jsonb', nullable: true })
  credentials: any;

  @Column({ default: false })
  is_default: boolean;

  @Column({ type: 'int', default: 3 })
  replicas: number;

  @Column({ type: 'float', default: 1 })
  cpu_limit: number;

  @Column({ type: 'float', default: 2 })
  memory_limit: number;

  @Column({ type: 'jsonb', nullable: true })
  additional_config: any;

  @Column({ nullable: true })
  last_deployed_at: Date;

  @Column({ nullable: true })
  last_deployment_status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
