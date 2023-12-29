export type Domain = {
  metadata: {
    artifact_type: string;
    id: string;
    name: string;
    created_by: string;
    created_at: Date;
    modified_by: string;
    modified_at: Date;
  };
  entity: DomainEntity;
};

export type DomainEntity = {
  id: string;
  num: number;
  name: string;
  description: string;
  modified: string;
  stewards: string[];
};

export type SystemEntity = {
  id: string;
  num: number;
  name: string;
  description: string;
  version_id: number;
  modified: string;
};

export type QueryEntity = {
  id: string;
  num: number;
  name: string;
  description: string;
  version_id: number;
  modified: string;
};
