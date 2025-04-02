import { ArtifactMetaData } from './artifact';

export type TDQRule = {
    id: string;
    entity_sample_id: string;
    dq_rule_id: string;
    settings: string;
    disabled: string;
    indicator_id: string;
    product_id: string;
    send_mail: string;
};
export type TMetadata = {
    id: string;
};
export type TData = {
    entity: TDQRule;
    metadata: TMetadata;
};

export type TaskMetadatabaseData = {
    id: string;
    name: string;
}

export type TaskScheduleEntityData = {
    description: string;
    enabled: boolean;
    schedule_type: string;
    schedule_params: string;
}

export type TaskScheduleData = {
    entity: TaskScheduleEntityData;
    metadata: ArtifactMetaData;
}

export type TaskEntityData = {
    name: string;
    description: string;
    short_description: string;
    query_id: string | null,
    system_connection_id: string | null,
    is_metadata_task: boolean,
    metadatabases: TaskMetadatabaseData[],
    schedules: TaskScheduleData[]
}

export type TaskData = {
    entity: TaskEntityData;
    metadata: ArtifactMetaData;
}

export type ProductEntityData = {
    name: string;
    description: string;
    short_description: string;
    indicator_ids: string[];
    product_ids: string[];
    entity_attribute_ids: string[];
    domain_id: string | null | undefined;
    entity_query_id: string | null | undefined;
    problem: string | undefined;
    consumer: string | undefined;
    value: string | undefined;
    finance_source: string | undefined;
    product_type_ids: string[];
    product_supply_variant_ids: string[];
    data_asset_ids: string[];
    dq_rules: [];
    link: string;
    limits: string;
    limits_internal: string;
    roles: string;
    term_link_ids: string[];
};

export type ProductData = {
    entity: ProductEntityData;
    metadata: ArtifactMetaData;
};

export type GroupEntityData = {
    name: string;
    description: string;
    user_roles: string[];
    permissions: string[];
};

export type GroupData = {
    entity: GroupEntityData;
    metadata: ArtifactMetaData;
};

export type IndicatorEntityData = {
    name: string;
    description: string;
    short_description: string;
    calc_code: string;
    dq_checks: string[];
    formula: string;
    domain_id: string | null;
    indicator_type_id: string;
    data_asset_ids: string[];
    dq_rules: [];
    examples: string;
    link: string;
    datatype_id: string | null;
    limits: string;
    limits_internal: string;
    roles: string;
    term_link_ids: string[];
};

export type IndicatorData = {
    entity: IndicatorEntityData;
    metadata: ArtifactMetaData;
};

export type ArtifactData = {
    id: string;
    artifact_type: string;
}

export type ETLEntityData = {
    name: string;
    description: string;
    short_description: string;
    code: string;
    algorithm: string;
    system_id: string | null;
    etl_type_id: string;
    business_entity_ids: string[];
    source_ids: ArtifactData[];
    target_ids: ArtifactData[];
};

export type ETLData = {
    entity: ETLEntityData;
    metadata: ArtifactMetaData;
};

export type DQRuleEntityData = {
    name: string;
    description: string;
    short_description: string;
    rule_ref: string;
    settings: string;
    rule_type_id: string | null;
};

export type DQRuleData = {
    entity: DQRuleEntityData;
    metadata: ArtifactMetaData;
};

export type AssetEntityData = {
    name: string;
    description: string;
    short_description: string;
    domain_id: string;
    system_id: string | null;
    entity_id: string | null;
    custom_attributes: [];
    dq_rules: [];
    roles: string;
    tech_name: string;
};

export type AssetData = {
    entity: AssetEntityData;
    metadata: ArtifactMetaData;
};