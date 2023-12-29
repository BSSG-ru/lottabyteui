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

export type ProductEntityData = {
    name: string;
    description: string;
    indicator_ids: string[];
    entity_attribute_ids: string[];
    domain_id: string | null;
    problem: string | null;
    consumer: string | null;
    value: string | null;
    finance_source: string | null;
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

export type DQRuleEntityData = {
    name: string;
    description: string;
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
    domain_id: string;
    system_id: string | null;
    entity_id: string | null;
    custom_attributes: [];
    dq_rules: [];
    roles: string;
};

export type AssetData = {
    entity: AssetEntityData;
    metadata: ArtifactMetaData;
};